/**
 * Tests unitaires pour AuthContext
 * Couvre : AuthProvider, login(), logout(), refreshSession(), useAuth(), useSession()
 */

import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock apiClient avant l'import du contexte
// Note: jest.mock est hoisted, donc la factory doit être auto-contenue
jest.mock('../../services/apiClient', () => ({
  apiClient: {
    setToken: jest.fn(),
    clearToken: jest.fn(),
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  },
}))

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

// Mock window.location.href via delete + redefine
delete (window as any).location
;(window as any).location = { href: '', assign: jest.fn(), reload: jest.fn() }

import { AuthProvider, useAuth, useSession } from '../../contexts/AuthContext'
import { apiClient as mockApiClientModule } from '../../services/apiClient'

// Référencer le mock après import
const mockApiClient = mockApiClientModule as jest.Mocked<typeof mockApiClientModule>

const mockUser = {
  id: 'user-1',
  email: 'alice@t4g.com',
  firstname: 'Alice',
  lastname: 'Martin',
  role: 'alumni',
}

// Composant helper pour tester le contexte
function AuthConsumer({ onAuth }: { onAuth?: (ctx: ReturnType<typeof useAuth>) => void }) {
  const ctx = useAuth()
  onAuth?.(ctx)
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="authenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="user">{ctx.user?.email ?? 'none'}</span>
      <span data-testid="error">{ctx.error ?? 'none'}</span>
    </div>
  )
}

function SessionConsumer() {
  const session = useSession()
  return (
    <div>
      <span data-testid="status">{session.status}</span>
      <span data-testid="session-user">{session.data?.user?.email ?? 'none'}</span>
    </div>
  )
}

function renderWithAuth(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}

beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
})

// ============================================================
// CHARGEMENT INITIAL
// ============================================================
describe('Chargement initial (loadUser)', () => {
  it('loading=true au montage, puis false après chargement sans token', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    renderWithAuth(<AuthConsumer />)
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
  })

  it('charge l\'utilisateur depuis le token localStorage si valide', async () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'token' ? 'valid-token' : null
    )
    mockApiClient.getCurrentUser.mockResolvedValue(mockUser)

    renderWithAuth(<AuthConsumer />)

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('alice@t4g.com')
    })
    expect(mockApiClient.setToken).toHaveBeenCalledWith('valid-token')
  })

  it('efface le token et user=null si getCurrentUser() échoue', async () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'token' ? 'expired-token' : null
    )
    mockApiClient.getCurrentUser.mockRejectedValue(new Error('Token expiré'))

    renderWithAuth(<AuthConsumer />)

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('none')
    })
    expect(mockApiClient.clearToken).toHaveBeenCalled()
  })

  it('isAuthenticated=false si pas de token', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    renderWithAuth(<AuthConsumer />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
  })
})

// ============================================================
// LOGIN
// ============================================================
describe('login()', () => {
  it('provider "dazno" - appelle apiClient.login avec provider dazeno', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockApiClient.login.mockResolvedValue({ token: 'tok', user: mockUser })

    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await act(async () => {
      await authCtx!.login('dazno', { token: 'dazno-tok' })
    })

    expect(mockApiClient.login).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'dazeno', token: 'dazno-tok' })
    )
    expect(screen.getByTestId('user').textContent).toBe('alice@t4g.com')
  })

  it('provider "dazno" - lance erreur si token manquant', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await expect(
      act(async () => authCtx!.login('dazno', {}))
    ).rejects.toThrow('Token Dazno manquant')
  })

  it('provider "t4g" - appelle apiClient.login avec providerUserData', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockApiClient.login.mockResolvedValue({ token: 'tok', user: mockUser })

    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    const providerUserData = { email: 'alice@t4g.com', name: 'Alice Martin', id: 'ext-1', role: 'alumni' }
    await act(async () => {
      await authCtx!.login('t4g', { providerUserData })
    })

    expect(mockApiClient.login).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 't4g', provider_user_data: providerUserData })
    )
  })

  it('provider "t4g" - lance erreur si providerUserData manquant', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await expect(
      act(async () => authCtx!.login('t4g', {}))
    ).rejects.toThrow('Données utilisateur t4g manquantes')
  })

  it('provider "linkedin" - appelle apiClient.login avec provider linkedin', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockApiClient.login.mockResolvedValue({ token: 'tok', user: mockUser })

    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await act(async () => {
      await authCtx!.login('linkedin', { providerUserData: { email: 'alice@linkedin.com', name: 'Alice' } })
    })

    expect(mockApiClient.login).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'linkedin' })
    )
  })

  it('provider "credentials" - parse email pour construire name et role', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockApiClient.login.mockResolvedValue({ token: 'tok', user: mockUser })

    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await act(async () => {
      await authCtx!.login('credentials', { email: 'jean.dupont@t4g.com', password: 'alumni' })
    })

    const loginCall = mockApiClient.login.mock.calls[0][0]
    expect(loginCall.provider_user_data.role).toBe('alumni')
    expect(loginCall.provider_user_data.name).toMatch(/Jean/)
  })

  it('provider inconnu - lance "Provider non supporté"', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await expect(
      act(async () => authCtx!.login('facebook', {}))
    ).rejects.toThrow('Provider non supporté: facebook')
  })

  it('erreur "Failed to fetch" locale - message backend non accessible', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockApiClient.login.mockRejectedValue(new TypeError('Failed to fetch'))
    // Simuler URL localhost
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'

    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await expect(
      act(async () => authCtx!.login('t4g', { providerUserData: { email: 'a@b.com' } }))
    ).rejects.toThrow(/backend non accessible|Backend non accessible/)
  })

  it('login réussi - error=null et user mis à jour', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockApiClient.login.mockResolvedValue({ token: 'tok', user: mockUser })

    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await act(async () => {
      await authCtx!.login('t4g', { providerUserData: { email: 'alice@t4g.com' } })
    })

    expect(screen.getByTestId('error').textContent).toBe('none')
    expect(screen.getByTestId('authenticated').textContent).toBe('true')
  })
})

// ============================================================
// LOGOUT
// ============================================================
describe('logout()', () => {
  it('remet user à null', async () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'token' ? 'tok' : null
    )
    mockApiClient.getCurrentUser.mockResolvedValue(mockUser)

    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice@t4g.com'))

    act(() => authCtx!.logout())

    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
  })

  it('efface le token via apiClient.clearToken()', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    act(() => authCtx!.logout())
    expect(mockApiClient.clearToken).toHaveBeenCalled()
  })
})

// ============================================================
// REFRESH SESSION
// ============================================================
describe('refreshSession()', () => {
  it('appelle apiClient.refreshToken() et met à jour le token', async () => {
    localStorageMock.getItem.mockReturnValue('old-token')
    mockApiClient.getCurrentUser.mockResolvedValue(mockUser)
    mockApiClient.refreshToken.mockResolvedValue({ token: 'new-token' })

    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice@t4g.com'))

    await act(async () => {
      await authCtx!.refreshSession()
    })

    expect(mockApiClient.setToken).toHaveBeenCalledWith('new-token')
  })

  it('appelle logout() si refreshToken() échoue', async () => {
    localStorageMock.getItem.mockReturnValue('expired-token')
    mockApiClient.getCurrentUser.mockResolvedValue(mockUser)
    mockApiClient.refreshToken.mockRejectedValue(new Error('Token expiré'))

    let authCtx: ReturnType<typeof useAuth> | undefined
    renderWithAuth(<AuthConsumer onAuth={(ctx) => { authCtx = ctx }} />)
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice@t4g.com'))

    await act(async () => {
      await authCtx!.refreshSession()
    })

    expect(mockApiClient.clearToken).toHaveBeenCalled()
    expect(screen.getByTestId('user').textContent).toBe('none')
  })
})

// ============================================================
// useAuth HORS PROVIDER
// ============================================================
describe('useAuth() hors provider', () => {
  it('lance une erreur si utilisé hors d\'un AuthProvider', () => {
    // Supprimer les warnings React dans la console pour ce test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(jest.fn())

    function BareConsumer() {
      const ctx = useAuth()
      return <div>{ctx.isAuthenticated}</div>
    }

    expect(() => render(<BareConsumer />)).toThrow(
      'useAuth doit être utilisé à l\'intérieur d\'un AuthProvider'
    )
    consoleError.mockRestore()
  })
})

// ============================================================
// useSession
// ============================================================
describe('useSession()', () => {
  it('status="loading" quand loading=true (juste après montage)', () => {
    // On bloque getCurrentUser pour simuler le chargement
    mockApiClient.getCurrentUser.mockImplementation(
      () => new Promise(jest.fn()) // jamais résolu
    )
    localStorageMock.getItem.mockReturnValue('tok')

    renderWithAuth(<SessionConsumer />)
    // Immédiatement après montage, loading=true
    expect(screen.getByTestId('status').textContent).toBe('loading')
  })

  it('status="authenticated" quand user présent', async () => {
    localStorageMock.getItem.mockReturnValue('tok')
    mockApiClient.getCurrentUser.mockResolvedValue(mockUser)

    renderWithAuth(<SessionConsumer />)
    await waitFor(() =>
      expect(screen.getByTestId('status').textContent).toBe('authenticated')
    )
    expect(screen.getByTestId('session-user').textContent).toBe('alice@t4g.com')
  })

  it('status="unauthenticated" quand user=null et loading=false', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    renderWithAuth(<SessionConsumer />)
    await waitFor(() =>
      expect(screen.getByTestId('status').textContent).toBe('unauthenticated')
    )
    expect(screen.getByTestId('session-user').textContent).toBe('none')
  })
})
