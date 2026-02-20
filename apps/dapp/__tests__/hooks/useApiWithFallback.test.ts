/**
 * Tests unitaires pour useApiWithFallback
 * Couvre : fallback, détection cache, hasNetworkIssue, options retries/timeout
 */

// Mock SWR pour contrôler complètement le comportement
const mockMutate = jest.fn()
let swrData: any = undefined
let swrError: any = undefined
let swrIsLoading = false

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((_path: string | null, _fetcher: any, options: any) => {
    return {
      data: swrData !== undefined ? swrData : options?.fallbackData,
      error: swrError,
      isLoading: swrIsLoading,
      mutate: mockMutate,
    }
  }),
}))

// Mock apiFetcher
jest.mock('../../services/config', () => ({
  ...jest.requireActual('../../services/config'),
  apiFetcher: jest.fn(),
}))

// Mock NetworkContext avec des valeurs contrôlables
let mockIsOnline = true
let mockApiAvailable = true

jest.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => ({
    isOnline: mockIsOnline,
    apiAvailable: mockApiAvailable,
    checkAPI: jest.fn(),
  }),
}))

import { renderHook } from '@testing-library/react'
import useSWR from 'swr'
import { useApiWithFallback } from '../../hooks/useApiWithFallback'
import { apiFetcher } from '../../services/config'

const mockApiFetcher = apiFetcher as jest.Mock
const mockUseSWR = useSWR as jest.Mock

interface TestData {
  count: number
  label: string
}

const FALLBACK: TestData = { count: 0, label: 'fallback' }
const API_DATA: TestData = { count: 42, label: 'from-api' }

beforeEach(() => {
  jest.clearAllMocks()
  mockIsOnline = true
  mockApiAvailable = true
  swrData = undefined
  swrError = undefined
  swrIsLoading = false
})

// ============================================================
// FALLBACK DATA
// ============================================================
describe('Fallback data', () => {
  it('retourne fallbackData quand les données SWR ne sont pas encore chargées', () => {
    swrData = undefined
    swrIsLoading = true

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(result.current.data).toEqual(FALLBACK)
  })

  it('retourne les données SWR quand disponibles', () => {
    swrData = API_DATA

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(result.current.data).toEqual(API_DATA)
  })

  it('retourne fallbackData si SWR échoue (data=undefined)', () => {
    swrData = undefined
    swrError = new Error('Network error')

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    // data || fallbackData => FALLBACK
    expect(result.current.data).toEqual(FALLBACK)
  })
})

// ============================================================
// isUsingCache
// ============================================================
describe('isUsingCache', () => {
  it('isUsingCache est falsy quand réseau OK et pas d\'erreur', () => {
    mockIsOnline = true
    mockApiAvailable = true
    swrData = API_DATA
    swrError = undefined

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(result.current.isUsingCache).toBeFalsy()
  })

  it('isUsingCache=true quand réseau KO et données != fallback', () => {
    mockIsOnline = false
    mockApiAvailable = false
    swrData = API_DATA // données en cache différentes du fallback
    swrError = undefined

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    // hasNetworkIssue=true (isOnline=false), data !== fallbackData => isUsingCache=true
    expect(result.current.isUsingCache).toBe(true)
  })

  it('isUsingCache=false quand réseau KO mais data === fallbackData', () => {
    mockIsOnline = false
    mockApiAvailable = false
    swrData = FALLBACK // même que le fallback

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    // data === fallbackData => isUsingCache=false même si réseau KO
    expect(result.current.isUsingCache).toBe(false)
  })
})

// ============================================================
// hasNetworkIssue
// ============================================================
describe('hasNetworkIssue', () => {
  it('hasNetworkIssue est truthy quand isOnline=false', () => {
    mockIsOnline = false
    mockApiAvailable = true

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(result.current.hasNetworkIssue).toBeTruthy()
  })

  it('hasNetworkIssue est truthy quand apiAvailable=false', () => {
    mockIsOnline = true
    mockApiAvailable = false

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(result.current.hasNetworkIssue).toBeTruthy()
  })

  it('hasNetworkIssue est falsy quand tout est OK', () => {
    mockIsOnline = true
    mockApiAvailable = true
    swrError = undefined

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(result.current.hasNetworkIssue).toBeFalsy()
  })

  it('hasNetworkIssue est truthy quand erreur marquée isNetworkError', () => {
    mockIsOnline = true
    mockApiAvailable = true
    swrError = Object.assign(new Error('ERR_CONNECTION_REFUSED'), { isNetworkError: true })

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(result.current.hasNetworkIssue).toBeTruthy()
  })
})

// ============================================================
// OPTIONS
// ============================================================
describe('Options retries et timeout', () => {
  it('passe les options retries et timeout au fetcher SWR', () => {
    renderHook(() =>
      useApiWithFallback<TestData>('/api/test', {
        fallbackData: FALLBACK,
        retries: 5,
        timeout: 3000,
      })
    )

    // Vérifier que le fetcher passé à SWR appellera apiFetcher avec les bons params
    const fetcher = mockUseSWR.mock.calls[0][1]
    fetcher('/api/test')
    expect(mockApiFetcher).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({ retries: 5, timeout: 3000 })
    )
  })

  it('utilise retries=2 et timeout=10000 par défaut', () => {

    renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    const fetcher = mockUseSWR.mock.calls[0][1]
    fetcher('/api/test')
    expect(mockApiFetcher).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({ retries: 2, timeout: 10000 })
    )
  })
})

// ============================================================
// PATH NULL
// ============================================================
describe('path null', () => {
  it('ne déclenche pas de fetch si path=null', () => {
    const { result } = renderHook(() =>
      useApiWithFallback<TestData>(null, { fallbackData: FALLBACK })
    )

    // SWR reçoit null, le fetcher ne doit pas être appelé
    expect(mockApiFetcher).not.toHaveBeenCalled()
    expect(result.current.data).toEqual(FALLBACK)
  })
})

// ============================================================
// EXPOSE mutate ET isLoading
// ============================================================
describe('Valeurs retournées', () => {
  it('expose la fonction mutate depuis SWR', () => {
    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(typeof result.current.mutate).toBe('function')
    expect(result.current.mutate).toBe(mockMutate)
  })

  it('expose isLoading', () => {
    swrIsLoading = true

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(result.current.isLoading).toBe(true)
  })

  it('expose error', () => {
    const err = new Error('API Error')
    swrError = err

    const { result } = renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    expect(result.current.error).toBe(err)
  })
})

// ============================================================
// CONFIGURATION SWR
// ============================================================
describe('Configuration SWR', () => {
  it('passe revalidateOnFocus=false à SWR', () => {
    renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    const swrOptions = mockUseSWR.mock.calls[0][2]
    expect(swrOptions.revalidateOnFocus).toBe(false)
  })

  it('passe shouldRetryOnError=true à SWR', () => {
    renderHook(() =>
      useApiWithFallback<TestData>('/api/test', { fallbackData: FALLBACK })
    )

    const swrOptions = mockUseSWR.mock.calls[0][2]
    expect(swrOptions.shouldRetryOnError).toBe(true)
  })
})
