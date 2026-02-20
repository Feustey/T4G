/**
 * Tests unitaires pour NetworkContext
 * Couvre : état réseau online/offline, checkAPI(), intervalle, nettoyage
 */

import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.Mock

// Mock AbortSignal.timeout
global.AbortSignal = {
  ...global.AbortSignal,
  timeout: jest.fn().mockReturnValue({} as AbortSignal),
} as any

import { NetworkProvider, useNetwork } from '../../contexts/NetworkContext'

function NetworkConsumer() {
  const { isOnline, apiAvailable, checkAPI } = useNetwork()
  return (
    <div>
      <span data-testid="is-online">{String(isOnline)}</span>
      <span data-testid="api-available">{String(apiAvailable)}</span>
      <button data-testid="check-btn" onClick={checkAPI}>Check</button>
    </div>
  )
}

function renderNetwork(navigatorOnline = true) {
  Object.defineProperty(navigator, 'onLine', {
    value: navigatorOnline,
    configurable: true,
  })
  return render(
    <NetworkProvider>
      <NetworkConsumer />
    </NetworkProvider>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
  // Par défaut l'API est accessible
  mockFetch.mockResolvedValue({ ok: true, status: 200 })
})

afterEach(() => {
  jest.useRealTimers()
})

// ============================================================
// ÉTAT INITIAL
// ============================================================
describe('État initial', () => {
  it('isOnline=true si navigator.onLine=true', async () => {
    renderNetwork(true)
    await waitFor(() => screen.getByTestId('is-online'))
    expect(screen.getByTestId('is-online').textContent).toBe('true')
  })

  it('isOnline=false si navigator.onLine=false', async () => {
    renderNetwork(false)
    await waitFor(() => screen.getByTestId('is-online'))
    expect(screen.getByTestId('is-online').textContent).toBe('false')
  })

  it('déclenche checkAPI() au montage', async () => {
    renderNetwork(true)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))
    expect(mockFetch.mock.calls[0][0]).toContain('/health')
  })
})

// ============================================================
// checkAPI()
// ============================================================
describe('checkAPI()', () => {
  it('apiAvailable=true si /health répond ok', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 })
    renderNetwork(true)
    await waitFor(() => expect(screen.getByTestId('api-available').textContent).toBe('true'))
  })

  it('apiAvailable=false si /health répond not ok (503)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 })
    renderNetwork(true)
    await waitFor(() => expect(screen.getByTestId('api-available').textContent).toBe('false'))
  })

  it('apiAvailable=false si fetch lance une erreur (timeout/réseau)', async () => {
    mockFetch.mockRejectedValue(new Error('fetch failed'))
    renderNetwork(true)
    await waitFor(() => expect(screen.getByTestId('api-available').textContent).toBe('false'))
  })

  it('appelle /health avec méthode HEAD et cache no-cache', async () => {
    renderNetwork(true)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))
    const [, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('HEAD')
    expect(options.cache).toBe('no-cache')
  })
})

// ============================================================
// ÉVÉNEMENTS ONLINE/OFFLINE
// ============================================================
describe('Événements online/offline du navigateur', () => {
  it('offline event → isOnline=false et apiAvailable=false', async () => {
    renderNetwork(true)
    await waitFor(() => expect(screen.getByTestId('api-available').textContent).toBe('true'))

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(screen.getByTestId('is-online').textContent).toBe('false')
    expect(screen.getByTestId('api-available').textContent).toBe('false')
  })

  it('online event → isOnline=true et checkAPI() est appelé', async () => {
    renderNetwork(false)
    // Mettre l'API en erreur au départ
    mockFetch.mockResolvedValue({ ok: false, status: 503 })
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())

    // Rétablir l'API
    mockFetch.mockResolvedValue({ ok: true, status: 200 })
    const callsBefore = mockFetch.mock.calls.length

    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })

    expect(screen.getByTestId('is-online').textContent).toBe('true')
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(callsBefore + 1))
  })
})

// ============================================================
// INTERVALLE
// ============================================================
describe('Intervalle de vérification', () => {
  it('appelle checkAPI() toutes les 30 secondes', async () => {
    renderNetwork(true)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))

    // Avancer de 30s
    act(() => jest.advanceTimersByTime(30000))
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))

    // Encore 30s
    act(() => jest.advanceTimersByTime(30000))
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3))
  })

  it('nettoie l\'intervalle et les listeners au démontage', async () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    const { unmount } = renderNetwork(true)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})

// ============================================================
// useNetwork VALEURS PAR DÉFAUT
// ============================================================
describe('useNetwork() - valeurs par défaut sans Provider', () => {
  it('retourne les valeurs par défaut (isOnline=true, apiAvailable=true)', () => {
    // Le contexte a des valeurs par défaut, on peut l'utiliser sans Provider
    function BareConsumer() {
      const net = useNetwork()
      return <span data-testid="default-online">{String(net.isOnline)}</span>
    }
    render(<BareConsumer />)
    expect(screen.getByTestId('default-online').textContent).toBe('true')
  })
})
