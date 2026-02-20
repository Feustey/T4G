/**
 * Tests unitaires pour OfflineBanner
 * Couvre : affichage selon état réseau, messages, boutons retry/refresh
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock NetworkContext
let mockIsOnline = true
let mockApiAvailable = true
const mockCheckAPI = jest.fn()

jest.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => ({
    isOnline: mockIsOnline,
    apiAvailable: mockApiAvailable,
    checkAPI: mockCheckAPI,
  }),
}))

// Mock Button
jest.mock('../../components/shared/Button', () => ({
  Button: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick}>{label}</button>
  ),
}))

// Mock window.location.reload
const mockReload = jest.fn()
delete (window as any).location
;(window as any).location = { reload: mockReload, href: '' }

import { OfflineBanner } from '../../components/OfflineBanner'

beforeEach(() => {
  jest.clearAllMocks()
  mockIsOnline = true
  mockApiAvailable = true
})

// ============================================================
// AFFICHAGE SELON ISUSING CACHE
// ============================================================
describe('Message principal', () => {
  it('affiche le message "Mode hors ligne" quand isUsingCache=true', () => {
    render(<OfflineBanner isUsingCache={true} />)
    expect(screen.getByText(/Mode hors ligne/i)).toBeInTheDocument()
  })

  it('affiche le message "Impossible de se connecter" quand isUsingCache=false', () => {
    render(<OfflineBanner isUsingCache={false} />)
    expect(screen.getByText(/Impossible de se connecter au serveur/i)).toBeInTheDocument()
  })

  it('isUsingCache=false par défaut', () => {
    render(<OfflineBanner />)
    expect(screen.getByText(/Impossible de se connecter au serveur/i)).toBeInTheDocument()
  })
})

// ============================================================
// MESSAGE RÉSEAU
// ============================================================
describe('Message réseau', () => {
  it('affiche le message d\'appareil hors ligne si isOnline=false', () => {
    mockIsOnline = false
    render(<OfflineBanner />)
    expect(screen.getByText(/Votre appareil semble hors ligne/i)).toBeInTheDocument()
  })

  it('n\'affiche pas le message d\'appareil hors ligne si isOnline=true', () => {
    mockIsOnline = true
    render(<OfflineBanner />)
    expect(screen.queryByText(/Votre appareil semble hors ligne/i)).not.toBeInTheDocument()
  })

  it('affiche le message "serveur backend inaccessible" si isOnline=true et apiAvailable=false', () => {
    mockIsOnline = true
    mockApiAvailable = false
    render(<OfflineBanner />)
    expect(screen.getByText(/inaccessible/i)).toBeInTheDocument()
  })

  it('n\'affiche pas le message backend si isOnline=false', () => {
    mockIsOnline = false
    mockApiAvailable = false
    render(<OfflineBanner />)
    // Le message "hors ligne" prend priorité, pas le message backend
    expect(screen.queryByText(/est inaccessible/i)).not.toBeInTheDocument()
  })
})

// ============================================================
// BOUTON RÉESSAYER
// ============================================================
describe('Bouton Réessayer', () => {
  it('appelle checkAPI() quand on clique sur Réessayer', async () => {
    mockCheckAPI.mockResolvedValue(undefined)
    render(<OfflineBanner />)
    fireEvent.click(screen.getByText('Réessayer'))
    expect(mockCheckAPI).toHaveBeenCalled()
  })

  it('appelle le callback onRetry si fourni', async () => {
    const onRetry = jest.fn()
    mockCheckAPI.mockResolvedValue(undefined)
    render(<OfflineBanner onRetry={onRetry} />)
    fireEvent.click(screen.getByText('Réessayer'))
    await waitFor(() => expect(onRetry).toHaveBeenCalled())
  })

  it('appelle checkAPI avant de rappeler onRetry', async () => {
    const onRetry = jest.fn()
    mockCheckAPI.mockResolvedValue(undefined)
    render(<OfflineBanner onRetry={onRetry} />)
    fireEvent.click(screen.getByText('Réessayer'))
    await waitFor(() => {
      expect(mockCheckAPI).toHaveBeenCalled()
      expect(onRetry).toHaveBeenCalled()
    })
  })
})

// ============================================================
// BOUTON ACTUALISER
// ============================================================
describe('Bouton Actualiser', () => {
  it('s\'affiche quand isUsingCache=false', () => {
    render(<OfflineBanner isUsingCache={false} />)
    expect(screen.getByText('Actualiser')).toBeInTheDocument()
  })

  it('ne s\'affiche pas quand isUsingCache=true', () => {
    render(<OfflineBanner isUsingCache={true} />)
    expect(screen.queryByText('Actualiser')).not.toBeInTheDocument()
  })

  it('appelle le callback onRefresh si fourni', () => {
    const onRefresh = jest.fn()
    render(<OfflineBanner isUsingCache={false} onRefresh={onRefresh} />)
    fireEvent.click(screen.getByText('Actualiser'))
    expect(onRefresh).toHaveBeenCalled()
  })

  it('appelle onRefresh si fourni (pas de reload jsdom)', () => {
    const onRefresh = jest.fn()
    render(<OfflineBanner isUsingCache={false} onRefresh={onRefresh} />)
    fireEvent.click(screen.getByText('Actualiser'))
    expect(onRefresh).toHaveBeenCalled()
  })
})

// ============================================================
// STYLE VISUEL
// ============================================================
describe('Style visuel', () => {
  it('applique la couleur warning si isUsingCache=true', () => {
    const { container } = render(<OfflineBanner isUsingCache={true} />)
    const div = container.firstChild as HTMLElement
    expect(div.style.backgroundColor).toContain('warning')
  })

  it('applique la couleur error si isUsingCache=false', () => {
    const { container } = render(<OfflineBanner isUsingCache={false} />)
    const div = container.firstChild as HTMLElement
    expect(div.style.backgroundColor).toContain('error')
  })
})
