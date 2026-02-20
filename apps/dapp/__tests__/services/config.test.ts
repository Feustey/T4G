// Mock fetch avant l'import
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.Mock

// Mock localStorage pour apiFetch
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

import { API_BASE_URL, apiUrl, apiFetch, apiFetcher } from '../../services/config'

beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

// ============================================================
// API_BASE_URL
// ============================================================
describe('API_BASE_URL', () => {
  it('should be defined', () => {
    expect(API_BASE_URL).toBeDefined()
    expect(typeof API_BASE_URL).toBe('string')
  })

  it('should not end with a slash', () => {
    expect(API_BASE_URL.endsWith('/')).toBe(false)
  })
})

// ============================================================
// apiUrl
// ============================================================
describe('apiUrl', () => {
  it('should return absolute URLs unchanged', () => {
    const absoluteUrl = 'https://example.com/api/test'
    expect(apiUrl(absoluteUrl)).toBe(absoluteUrl)
  })

  it('should return HTTP URLs unchanged', () => {
    const httpUrl = 'http://example.com/api/test'
    expect(apiUrl(httpUrl)).toBe(httpUrl)
  })

  it('should prepend API_BASE_URL to relative paths', () => {
    const result = apiUrl('/users')
    expect(result).toContain('/users')
    expect(result.startsWith('http')).toBe(true)
  })

  it('should handle paths without leading slash', () => {
    const result = apiUrl('users')
    expect(result).toContain('/users')
  })
})

// ============================================================
// apiFetch
// ============================================================
describe('apiFetch', () => {
  it('should be a function', () => {
    expect(typeof apiFetch).toBe('function')
  })

  it('inclut le token JWT depuis localStorage si présent', async () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'token' ? 'my-token' : null
    )
    mockFetch.mockResolvedValue({ ok: true, status: 200 })
    await apiFetch('/api/test')
    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['Authorization']).toBe('Bearer my-token')
  })

  it('ne met pas Authorization si pas de token', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockFetch.mockResolvedValue({ ok: true, status: 200 })
    await apiFetch('/api/test')
    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['Authorization']).toBeUndefined()
  })

  it('retourne la réponse fetch brute', async () => {
    const mockResponse = { ok: true, status: 200 }
    mockFetch.mockResolvedValue(mockResponse)
    localStorageMock.getItem.mockReturnValue(null)
    const result = await apiFetch('/api/test')
    expect(result).toBe(mockResponse)
  })

  it('lance une erreur réseau améliorée pour "Failed to fetch"', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(apiFetch('/api/test')).rejects.toThrow('Impossible de se connecter au serveur')
  })

  it('utilise credentials: include par défaut', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockFetch.mockResolvedValue({ ok: true, status: 200 })
    await apiFetch('/api/test')
    expect(mockFetch.mock.calls[0][1].credentials).toBe('include')
  })
})

// ============================================================
// apiFetcher
// ============================================================
describe('apiFetcher', () => {
  it('retourne les données JSON si la réponse est ok', async () => {
    const data = { id: 1, name: 'Test' }
    localStorageMock.getItem.mockReturnValue(null)
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(data),
      clone: jest.fn().mockReturnThis(),
      text: jest.fn().mockResolvedValue(''),
    })
    const result = await apiFetcher('/api/test')
    expect(result).toEqual(data)
  })

  it('sauvegarde les données dans le cache local après succès', async () => {
    const data = { count: 5 }
    localStorageMock.getItem.mockReturnValue(null)
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(data),
      clone: jest.fn().mockReturnThis(),
      text: jest.fn().mockResolvedValue(''),
    })
    await apiFetcher('/api/test')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      expect.stringContaining('fetcher_cache_'),
      expect.stringContaining('"count":5')
    )
  })

  it('lance une erreur avec status pour les réponses 4xx', async () => {
    jest.useRealTimers()
    localStorageMock.getItem.mockReturnValue(null)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      clone: jest.fn().mockReturnThis(),
      text: jest.fn().mockResolvedValue('Not found'),
    })
    await expect(apiFetcher('/api/test', { retries: 1 })).rejects.toMatchObject({ status: 404 })
    jest.useFakeTimers()
  })

  it('utilise le cache en cas d\'erreur réseau sur la dernière tentative', async () => {
    jest.useRealTimers()
    const cachedData = { cached: true }
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key.includes('fetcher_cache_')) {
        return JSON.stringify({ data: cachedData, timestamp: Date.now() })
      }
      return null
    })
    mockFetch.mockRejectedValue(new Error('Failed to fetch'))

    const result = await apiFetcher('/api/test', { retries: 1, useCacheFallback: true })
    expect(result).toEqual(cachedData)
    jest.useFakeTimers()
  })

  it('marque l\'erreur avec isNetworkError=true pour les erreurs réseau', async () => {
    jest.useRealTimers()
    localStorageMock.getItem.mockReturnValue(null)
    mockFetch.mockRejectedValue(new Error('ERR_CONNECTION_REFUSED'))

    await expect(apiFetcher('/api/test', { retries: 1, useCacheFallback: false }))
      .rejects.toMatchObject({ isNetworkError: true })
    jest.useFakeTimers()
  })
})
