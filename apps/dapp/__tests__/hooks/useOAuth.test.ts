/**
 * Tests unitaires pour useOAuth
 * Couvre : loginWithDazno, loginWithLinkedIn, loginWitht4g, handleOAuthCallback,
 *           checkExistingDaznoSession, initAuth
 */

import { renderHook, act } from '@testing-library/react'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.Mock

// Mock next/router
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock AuthContext
const mockLogin = jest.fn()
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

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

// Mock window.location
delete (window as any).location
window.location = { href: '', origin: 'http://localhost:3000' } as any

import { useOAuth } from '../../hooks/useOAuth'

beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

// ============================================================
// checkExistingDaznoSession
// ============================================================
describe('checkExistingDaznoSession()', () => {
  it('retourne null si pas de dazno_token en localStorage', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    const { result } = renderHook(() => useOAuth())
    const token = await result.current.checkExistingDaznoSession()
    expect(token).toBeNull()
  })

  it('retourne le token si la vérification réussit', async () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'dazno_token' ? 'existing-token' : null
    )
    mockFetch.mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useOAuth())
    const token = await result.current.checkExistingDaznoSession()
    expect(token).toBe('existing-token')
  })

  it('supprime le token et retourne null si la vérification échoue', async () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'dazno_token' ? 'invalid-token' : null
    )
    mockFetch.mockResolvedValue({ ok: false, status: 401 })

    const { result } = renderHook(() => useOAuth())
    const token = await result.current.checkExistingDaznoSession()
    expect(token).toBeNull()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('dazno_token')
  })

  it('retourne null si fetch lance une erreur réseau', async () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'dazno_token' ? 'some-token' : null
    )
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useOAuth())
    const token = await result.current.checkExistingDaznoSession()
    expect(token).toBeNull()
  })
})

// ============================================================
// loginWithDazno
// ============================================================
describe('loginWithDazno()', () => {
  it('lance une erreur si pas de token disponible', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    const { result } = renderHook(() => useOAuth())
    await expect(result.current.loginWithDazno()).rejects.toThrow('Aucune session Dazno active')
  })

  it('lance une erreur si le token est invalide', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 })
    const { result } = renderHook(() => useOAuth())
    await expect(result.current.loginWithDazno('bad-token')).rejects.toThrow('Token Dazno invalide')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('dazno_token')
  })

  it('appelle login("dazeno") et redirige vers /dashboard si succès', async () => {
    const daznoUser = { user: { email: 'alice@dazno.de', name: 'Alice' } }
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(daznoUser),
    })
    mockLogin.mockResolvedValue(undefined)

    const { result } = renderHook(() => useOAuth())
    await act(async () => {
      await result.current.loginWithDazno('valid-token')
    })

    expect(mockLogin).toHaveBeenCalledWith('dazeno', expect.objectContaining({ token: 'valid-token' }))
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('sauvegarde le token Dazno dans localStorage', async () => {
    const daznoUser = { user: { email: 'alice@dazno.de', name: 'Alice' } }
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(daznoUser),
    })
    mockLogin.mockResolvedValue(undefined)

    const { result } = renderHook(() => useOAuth())
    await act(async () => {
      await result.current.loginWithDazno('valid-token')
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('dazno_token', 'valid-token')
  })
})

// ============================================================
// loginWithLinkedIn
// ============================================================
describe('loginWithLinkedIn()', () => {
  it('lance une erreur si LINKEDIN_CLIENT_ID non configuré', () => {
    delete process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID
    delete process.env.LINKEDIN_CLIENT_ID

    const { result } = renderHook(() => useOAuth())
    expect(() => result.current.loginWithLinkedIn()).toThrow('Configuration LinkedIn manquante')
  })

  it('sauvegarde le state OAuth dans sessionStorage avec LINKEDIN_CLIENT_ID configuré', () => {
    process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID = 'linkedin-client-id'

    const { result } = renderHook(() => useOAuth())
    // Ne pas vérifier window.location.href (jsdom ne supporte pas la navigation)
    // Vérifier le comportement observable : sessionStorage state
    result.current.loginWithLinkedIn()

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'linkedin_oauth_state',
      expect.any(String)
    )
  })

  it('génère un state OAuth aléatoire alphanumérique', () => {
    process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID = 'linkedin-client-id'

    const { result } = renderHook(() => useOAuth())
    result.current.loginWithLinkedIn()

    const stateCall = sessionStorageMock.setItem.mock.calls.find(
      ([key]: [string]) => key === 'linkedin_oauth_state'
    )
    expect(stateCall).toBeDefined()
    expect(stateCall![1]).toMatch(/^[a-z0-9]+$/) // state aléatoire alphanumérique
    expect(stateCall![1].length).toBeGreaterThan(0)
  })
})

// ============================================================
// loginWitht4g
// ============================================================
describe('loginWitht4g()', () => {
  it('lance une erreur si T4G_CLIENT_ID non configuré', () => {
    delete process.env.NEXT_PUBLIC_T4G_CLIENT_ID
    delete process.env.CLIENT_ID
    delete process.env.NEXT_PUBLIC_T4G_AUTH_URL
    delete process.env.AUTH_URL

    const { result } = renderHook(() => useOAuth())
    expect(() => result.current.loginWitht4g()).toThrow('Configuration t4g manquante')
  })

  it('sauvegarde le state OAuth t4g dans sessionStorage avec config complète', () => {
    process.env.NEXT_PUBLIC_T4G_CLIENT_ID = 't4g-client-id'
    process.env.NEXT_PUBLIC_T4G_AUTH_URL = 'https://auth.t4g.com'

    const { result } = renderHook(() => useOAuth())
    result.current.loginWitht4g()

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      't4g_oauth_state',
      expect.any(String)
    )
  })

  it('lance une erreur si AUTH_URL manquant mais CLIENT_ID présent', () => {
    process.env.NEXT_PUBLIC_T4G_CLIENT_ID = 't4g-client-id'
    delete process.env.NEXT_PUBLIC_T4G_AUTH_URL
    delete process.env.AUTH_URL

    const { result } = renderHook(() => useOAuth())
    expect(() => result.current.loginWitht4g()).toThrow('Configuration t4g manquante')
  })
})

// ============================================================
// handleOAuthCallback
// ============================================================
describe('handleOAuthCallback()', () => {
  it('échange le code via /api/auth/callback/:provider et login', async () => {
    const userData = {
      email: 'alice@linkedin.com',
      given_name: 'Alice',
      family_name: 'Martin',
      sub: 'li-123',
    }
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(userData),
    })
    mockLogin.mockResolvedValue(undefined)
    sessionStorageMock.getItem.mockReturnValue('matching-state')

    const { result } = renderHook(() => useOAuth())
    await act(async () => {
      await result.current.handleOAuthCallback('linkedin', 'auth-code-123', 'matching-state')
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/callback/linkedin',
      expect.objectContaining({ method: 'POST' })
    )
    const fetchBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(fetchBody.code).toBe('auth-code-123')

    expect(mockLogin).toHaveBeenCalledWith('linkedin', expect.objectContaining({
      providerUserData: expect.objectContaining({ email: 'alice@linkedin.com' }),
    }))
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('fonctionne avec provider t4g', async () => {
    const userData = { email: 't4g@user.com', given_name: 'Bob', family_name: 'Dupont', sub: 't4g-456' }
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(userData),
    })
    mockLogin.mockResolvedValue(undefined)
    sessionStorageMock.getItem.mockReturnValue('state-xyz')

    const { result } = renderHook(() => useOAuth())
    await act(async () => {
      await result.current.handleOAuthCallback('t4g', 'code-t4g', 'state-xyz')
    })

    expect(mockFetch.mock.calls[0][0]).toBe('/api/auth/callback/t4g')
    expect(mockLogin).toHaveBeenCalledWith('t4g', expect.any(Object))
  })

  it('lance une erreur si la réponse du callback n\'est pas ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Code invalide' }),
    })
    sessionStorageMock.getItem.mockReturnValue('state-abc')

    const { result } = renderHook(() => useOAuth())
    await expect(
      act(async () => result.current.handleOAuthCallback('linkedin', 'bad-code', 'state-abc'))
    ).rejects.toThrow('Code invalide')
  })

  it('nettoie le state sessionStorage après succès', async () => {
    const userData = { email: 'x@y.com', sub: 'id-1' }
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(userData),
    })
    mockLogin.mockResolvedValue(undefined)
    sessionStorageMock.getItem.mockReturnValue('state-clean')

    const { result } = renderHook(() => useOAuth())
    await act(async () => {
      await result.current.handleOAuthCallback('t4g', 'code-ok', 'state-clean')
    })

    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('t4g_oauth_state')
  })

  it('en production, vérifie le state CSRF et rejette si mismatch', async () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true })

    sessionStorageMock.getItem.mockReturnValue('saved-state')

    const { result } = renderHook(() => useOAuth())
    await expect(
      act(async () =>
        result.current.handleOAuthCallback('linkedin', 'code', 'different-state')
      )
    ).rejects.toThrow('State invalide')

    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, configurable: true })
  })
})

// ============================================================
// initAuth
// ============================================================
describe('initAuth()', () => {
  it('retourne false si aucune session active', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useOAuth())
    const res = await result.current.initAuth()
    expect(res).toBe(false)
  })

  it('appelle loginWithDazno si session Dazno existante', async () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'dazno_token' ? 'dazno-existing' : null
    )
    // Vérification du token OK
    const daznoUser = { user: { email: 'u@dazno.de', name: 'User' } }
    mockFetch
      .mockResolvedValueOnce({ ok: true }) // checkExistingDaznoSession verify
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(daznoUser) }) // loginWithDazno verify
    mockLogin.mockResolvedValue(undefined)

    const { result } = renderHook(() => useOAuth())
    await act(async () => {
      await result.current.initAuth()
    })

    expect(mockLogin).toHaveBeenCalledWith('dazeno', expect.any(Object))
  })
})
