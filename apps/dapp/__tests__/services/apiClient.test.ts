/**
 * Tests unitaires pour APIClient
 * Couvre : gestion du token, cache, gestion d'erreurs HTTP, et tous les endpoints
 */

// Mock fetch globalement
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Import après les mocks
import { apiClient } from '../../services/apiClient'

const mockFetch = global.fetch as jest.Mock

function mockResponse(body: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
    clone: jest.fn().mockReturnThis(),
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  // Réinitialiser le token interne de l'instance
  apiClient.clearToken()
})

// ============================================================
// GESTION DU TOKEN
// ============================================================
describe('Gestion du token', () => {
  it('setToken() sauvegarde le token en localStorage', () => {
    apiClient.setToken('my-jwt-token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'my-jwt-token')
  })

  it('clearToken() supprime le token du localStorage', () => {
    apiClient.setToken('my-jwt-token')
    apiClient.clearToken()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('inclut le header Authorization si token présent via setToken()', async () => {
    mockFetch.mockReturnValue(mockResponse({ status: 'ok' }))
    apiClient.setToken('test-token-123')
    await apiClient.healthCheck()
    const callHeaders = mockFetch.mock.calls[0][1].headers
    expect(callHeaders['Authorization']).toBe('Bearer test-token-123')
  })

  it('lit le token depuis localStorage si pas de setToken()', async () => {
    mockFetch.mockReturnValue(mockResponse({ status: 'ok' }))
    localStorageMock.getItem.mockReturnValue('stored-token')
    await apiClient.healthCheck()
    const callHeaders = mockFetch.mock.calls[0][1].headers
    expect(callHeaders['Authorization']).toBe('Bearer stored-token')
  })

  it('pas de header Authorization si aucun token', async () => {
    mockFetch.mockReturnValue(mockResponse({ status: 'ok' }))
    localStorageMock.getItem.mockReturnValue(null)
    await apiClient.healthCheck()
    const callHeaders = mockFetch.mock.calls[0][1].headers
    expect(callHeaders['Authorization']).toBeUndefined()
  })
})

// ============================================================
// GESTION DU CACHE
// ============================================================
describe('Gestion du cache', () => {
  it('sauvegarde les données GET dans localStorage après succès', async () => {
    const data = { status: 'ok' }
    mockFetch.mockReturnValue(mockResponse(data))
    await apiClient.healthCheck()
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      expect.stringContaining('api_cache_'),
      expect.stringContaining('"status":"ok"')
    )
  })

  it('ne sauvegarde pas dans le cache pour les POST', async () => {
    const loginData = { token: 'abc', user: { id: '1', email: 'a@b.com', firstname: 'A', lastname: 'B', role: 'student' } }
    mockFetch.mockReturnValue(mockResponse(loginData))
    await apiClient.login({ email: 'a@b.com', provider: 't4g' })
    const cacheSetCalls = localStorageMock.setItem.mock.calls.filter(
      ([key]: [string]) => key.startsWith('api_cache_')
    )
    expect(cacheSetCalls).toHaveLength(0)
  })

  it('utilise le cache pour un GET en cas d\'erreur réseau', async () => {
    const cachedData = { status: 'ok', cached: true }
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key.includes('api_cache_')) {
        return JSON.stringify({ data: cachedData, timestamp: Date.now() })
      }
      return null
    })
    mockFetch.mockRejectedValue(new Error('Network error'))
    const result = await apiClient.healthCheck()
    expect(result).toEqual(cachedData)
  })

  it('retourne null depuis le cache si expiré (> 24h)', async () => {
    const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000)
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key.includes('api_cache_')) {
        return JSON.stringify({ data: { old: true }, timestamp: expiredTimestamp })
      }
      return null
    })
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(apiClient.healthCheck()).rejects.toThrow()
  })
})

// ============================================================
// GESTION DES ERREURS HTTP
// ============================================================
describe('Gestion des erreurs HTTP', () => {
  it('401 efface le token et lance une erreur d\'authentification', async () => {
    mockFetch.mockReturnValue(mockResponse({ message: 'Unauthorized' }, 401))
    apiClient.setToken('expired-token')
    await expect(apiClient.getCurrentUser()).rejects.toThrow('Non authentifié')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('403 lance "Accès non autorisé"', async () => {
    mockFetch.mockReturnValue(mockResponse({}, 403))
    await expect(apiClient.getAdminStats()).rejects.toThrow('Accès non autorisé')
  })

  it('404 lance "Ressource non trouvée"', async () => {
    mockFetch.mockReturnValue(mockResponse({}, 404))
    await expect(apiClient.getUser('unknown-id')).rejects.toThrow('Ressource non trouvée')
  })

  it('204 retourne un objet vide sans appeler json()', async () => {
    const responseMock = {
      ok: true,
      status: 204,
      json: jest.fn(),
      clone: jest.fn().mockReturnThis(),
    }
    mockFetch.mockReturnValue(Promise.resolve(responseMock))
    const result = await apiClient.deleteUser('user-id')
    expect(result).toEqual({})
    expect(responseMock.json).not.toHaveBeenCalled()
  })

  it('500 lance l\'erreur du body JSON si disponible', async () => {
    mockFetch.mockReturnValue(mockResponse({ message: 'Internal server error' }, 500))
    await expect(apiClient.getMetrics()).rejects.toThrow('Internal server error')
  })

  it('erreur réseau sans cache disponible lance une erreur', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(apiClient.healthCheck()).rejects.toThrow()
  })
})

// ============================================================
// USERS API
// ============================================================
describe('Users API', () => {
  it('getUsers() sans params appelle /api/users', async () => {
    mockFetch.mockReturnValue(mockResponse([]))
    await apiClient.getUsers()
    expect(mockFetch.mock.calls[0][0]).toContain('/api/users')
  })

  it('getUsers() avec role construit correctement la query string', async () => {
    mockFetch.mockReturnValue(mockResponse([]))
    await apiClient.getUsers({ role: 'mentor', limit: 10, offset: 20 })
    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('role=mentor')
    expect(url).toContain('limit=10')
    expect(url).toContain('offset=20')
  })

  it('getUser(id) appelle /api/users/:id', async () => {
    mockFetch.mockReturnValue(mockResponse({ id: 'abc', email: 'x@y.com', firstname: 'X', lastname: 'Y', role: 'student' }))
    await apiClient.getUser('abc')
    expect(mockFetch.mock.calls[0][0]).toContain('/api/users/abc')
  })

  it('getCurrentUser() appelle /api/users/me', async () => {
    mockFetch.mockReturnValue(mockResponse({ id: 'me', email: 'me@t4g.com', firstname: 'Me', lastname: 'User', role: 'alumni' }))
    await apiClient.getCurrentUser()
    expect(mockFetch.mock.calls[0][0]).toContain('/api/users/me')
  })

  it('createUser() envoie POST avec body correct', async () => {
    const userData = { email: 'new@t4g.com', first_name: 'New', last_name: 'User', role: 'student' }
    mockFetch.mockReturnValue(mockResponse({ id: 'new-id', ...userData, firstname: 'New', lastname: 'User' }))
    await apiClient.createUser(userData)
    const [, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual(userData)
  })

  it('updateUser() envoie PUT avec les données partielles', async () => {
    mockFetch.mockReturnValue(mockResponse({ id: 'u1', email: 'a@b.com', firstname: 'A', lastname: 'B', role: 'mentor' }))
    await apiClient.updateUser('u1', { bio: 'Updated bio' })
    const [url, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('PUT')
    expect(url).toContain('/api/users/u1')
    expect(JSON.parse(options.body)).toEqual({ bio: 'Updated bio' })
  })

  it('deleteUser() envoie DELETE', async () => {
    mockFetch.mockReturnValue(Promise.resolve({ ok: true, status: 204, json: jest.fn(), clone: jest.fn().mockReturnThis() }))
    await apiClient.deleteUser('u1')
    const [url, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('DELETE')
    expect(url).toContain('/api/users/u1')
  })
})

// ============================================================
// MENTORING API
// ============================================================
describe('Mentoring API', () => {
  it('getMentoringRequests() sans filtre appelle /api/mentoring/requests', async () => {
    mockFetch.mockReturnValue(mockResponse([]))
    await apiClient.getMentoringRequests()
    expect(mockFetch.mock.calls[0][0]).toContain('/api/mentoring/requests')
  })

  it('getMentoringRequests() filtre par status', async () => {
    mockFetch.mockReturnValue(mockResponse([]))
    await apiClient.getMentoringRequests({ status: 'PENDING' })
    expect(mockFetch.mock.calls[0][0]).toContain('status=PENDING')
  })

  it('getMentoringRequests() filtre par mentee_id et mentor_id', async () => {
    mockFetch.mockReturnValue(mockResponse([]))
    await apiClient.getMentoringRequests({ mentee_id: 'mentee1', mentor_id: 'mentor1' })
    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('mentee_id=mentee1')
    expect(url).toContain('mentor_id=mentor1')
  })

  it('createMentoringRequest() envoie POST vers /api/mentoring/requests', async () => {
    const req = { title: 'Help needed', description: 'Learn Rust', mentee_id: 'm1' }
    mockFetch.mockReturnValue(mockResponse({ id: 'req1', ...req, status: 'PENDING', created_at: '', updated_at: '' }))
    await apiClient.createMentoringRequest(req)
    const [url, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(url).toContain('/api/mentoring/requests')
    expect(JSON.parse(options.body)).toEqual(req)
  })

  it('assignMentor() envoie POST vers /requests/:id/assign', async () => {
    mockFetch.mockReturnValue(mockResponse({ id: 'req1', status: 'ASSIGNED', title: 'T', description: 'D', mentee_id: 'm1', created_at: '', updated_at: '' }))
    await apiClient.assignMentor('req1', 'mentor99')
    const [url, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(url).toContain('/api/mentoring/requests/req1/assign')
    expect(JSON.parse(options.body)).toEqual({ mentor_id: 'mentor99' })
  })
})

// ============================================================
// RGB PROOFS API
// ============================================================
describe('RGB Proofs API', () => {
  it('createProof() envoie POST avec les champs requis', async () => {
    const proofReq = { request_id: 'r1', mentor_id: 'm1', mentee_id: 'me1', rating: 5 }
    mockFetch.mockReturnValue(mockResponse({ proof: {}, contract_id: 'c1', signature: 'sig' }))
    await apiClient.createProof(proofReq)
    const [url, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(url).toContain('/api/proofs')
    expect(JSON.parse(options.body)).toEqual(proofReq)
  })

  it('verifyProof() appelle GET /api/proofs/:id/verify', async () => {
    mockFetch.mockReturnValue(mockResponse({ valid: true }))
    await apiClient.verifyProof('proof-123')
    expect(mockFetch.mock.calls[0][0]).toContain('/api/proofs/proof-123/verify')
  })

  it('transferProof() envoie POST vers /api/proofs/:id/transfer', async () => {
    const transfer = { from_outpoint: 'outpoint1', to_outpoint: 'outpoint2', amount: 1000 }
    mockFetch.mockReturnValue(mockResponse({ transfer_id: 't1', status: 'PENDING' }))
    await apiClient.transferProof('proof-123', transfer)
    const [url, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(url).toContain('/api/proofs/proof-123/transfer')
    expect(JSON.parse(options.body)).toEqual(transfer)
  })

  it('getProofHistory() appelle GET /api/proofs/:id/history', async () => {
    mockFetch.mockReturnValue(mockResponse([]))
    await apiClient.getProofHistory('proof-abc')
    expect(mockFetch.mock.calls[0][0]).toContain('/api/proofs/proof-abc/history')
  })

  it('getProofs() avec contract_id ajoute le query param', async () => {
    mockFetch.mockReturnValue(mockResponse([]))
    await apiClient.getProofs({ contract_id: 'cid-1' })
    expect(mockFetch.mock.calls[0][0]).toContain('contract_id=cid-1')
  })
})

// ============================================================
// AUTH API
// ============================================================
describe('Auth API', () => {
  it('login() stocke le token si response.token présent', async () => {
    mockFetch.mockReturnValue(mockResponse({ token: 'jwt-abc', user: { id: '1', email: 'a@b.com', firstname: 'A', lastname: 'B', role: 'student' } }))
    await apiClient.login({ email: 'a@b.com', provider: 't4g' })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'jwt-abc')
  })

  it('login() ne stocke pas de token si la réponse n\'en contient pas', async () => {
    mockFetch.mockReturnValue(mockResponse({ user: { id: '1', email: 'a@b.com', firstname: 'A', lastname: 'B', role: 'student' } }))
    // pas de token dans la response => setItem ne doit pas être appelé avec 'token'
    await apiClient.login({ email: 'a@b.com', provider: 't4g' } as any)
    const tokenSet = localStorageMock.setItem.mock.calls.find(([key]: [string]) => key === 'token')
    expect(tokenSet).toBeUndefined()
  })

  it('logout() efface le token', () => {
    apiClient.setToken('tok')
    apiClient.logout()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('refreshToken() envoie POST vers /api/auth/refresh', async () => {
    mockFetch.mockReturnValue(mockResponse({ token: 'new-token' }))
    await apiClient.refreshToken()
    const [url, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(url).toContain('/api/auth/refresh')
  })
})

// ============================================================
// LIGHTNING API
// ============================================================
describe('Lightning API', () => {
  it('getLightningNodeInfo() appelle GET /api/lightning/node/info', async () => {
    mockFetch.mockReturnValue(mockResponse({ identity_pubkey: 'pk', alias: 'node', num_channels: 5, synced_to_chain: true }))
    await apiClient.getLightningNodeInfo()
    expect(mockFetch.mock.calls[0][0]).toContain('/api/lightning/node/info')
  })

  it('createLightningInvoice() envoie POST avec amount_msat et description', async () => {
    const invoiceReq = { amount_msat: 50000, description: 'Test invoice', expiry_seconds: 3600 }
    mockFetch.mockReturnValue(mockResponse({ payment_request: 'lnbc...', payment_hash: 'hash', amount_msat: 50000, description: 'Test', expiry: 3600 }))
    await apiClient.createLightningInvoice(invoiceReq)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/lightning/invoice')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual(invoiceReq)
  })

  it('payLightningInvoice() envoie POST avec payment_request', async () => {
    mockFetch.mockReturnValue(mockResponse({ payment_hash: 'h', amount_msat: 1000, status: 'SUCCEEDED' }))
    await apiClient.payLightningInvoice('lnbc500u...')
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/lightning/payment')
    expect(JSON.parse(options.body)).toEqual({ payment_request: 'lnbc500u...' })
  })

  it('getPaymentStatus() appelle GET /api/lightning/payment/:hash/status', async () => {
    mockFetch.mockReturnValue(mockResponse({ payment_hash: 'abc', status: 'SUCCEEDED' }))
    await apiClient.getPaymentStatus('abc123')
    expect(mockFetch.mock.calls[0][0]).toContain('/api/lightning/payment/abc123/status')
  })
})

// ============================================================
// ADMIN API
// ============================================================
describe('Admin API', () => {
  it('getAdminWallets() sans params n\'ajoute pas de query string', async () => {
    mockFetch.mockReturnValue(mockResponse([]))
    await apiClient.getAdminWallets()
    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('/api/admin/wallets')
    expect(url).not.toContain('?')
  })

  it('getAdminWallets() avec params construit la query string', async () => {
    mockFetch.mockReturnValue(mockResponse([]))
    await apiClient.getAdminWallets({ limit: 20, offset: 40, min_balance: 100 })
    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('limit=20')
    expect(url).toContain('offset=40')
    expect(url).toContain('min_balance=100')
  })

  it('getAdminStats() appelle GET /api/admin/stats', async () => {
    mockFetch.mockReturnValue(mockResponse({ total_users: 10, total_mentoring_requests: 5, total_rgb_proofs: 3, total_lightning_volume_msat: 0, active_users_last_30_days: 2, timestamp: '' }))
    await apiClient.getAdminStats()
    expect(mockFetch.mock.calls[0][0]).toContain('/api/admin/stats')
  })
})

// ============================================================
// USER WALLET & HEALTH
// ============================================================
describe('UserWallet & Health', () => {
  it('getUserWallet() appelle GET /api/users/:id/wallet', async () => {
    mockFetch.mockReturnValue(mockResponse({ user_id: 'u1', lightning_address: 'u1@t4g.com', balance_msat: 0, pending_balance_msat: 0, total_received_msat: 0, total_sent_msat: 0, recent_transactions: [] }))
    await apiClient.getUserWallet('u1')
    expect(mockFetch.mock.calls[0][0]).toContain('/api/users/u1/wallet')
  })

  it('healthCheck() appelle GET /health', async () => {
    mockFetch.mockReturnValue(mockResponse({ status: 'ok', database: true, lightning: false, rgb: true, timestamp: '' }))
    await apiClient.healthCheck()
    expect(mockFetch.mock.calls[0][0]).toContain('/health')
  })
})
