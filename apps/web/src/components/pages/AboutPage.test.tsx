import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AboutPage } from './AboutPage'

const auth = vi.hoisted(() => ({
  state: {
    isAuthenticated: false,
    logout: vi.fn(),
    status: 'anonymous' as 'anonymous' | 'authenticated' | 'initializing',
  },
}))

vi.mock('../../services/auth/use-auth', () => ({ useAuth: () => auth.state }))

function renderPage(path = '/sobre') {
  return render(<MemoryRouter initialEntries={[path]}><AboutPage /></MemoryRouter>)
}

afterEach(() => {
  auth.state.isAuthenticated = false
  auth.state.status = 'anonymous'
  vi.unstubAllGlobals()
})

describe('AboutPage', () => {
  it('renders the approved institutional content and visitor actions without requests', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { container } = renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Projetos, pessoas e ideias em conexão.' })).toBeVisible()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText('Um espaço para descobrir e compartilhar')).toBeVisible()
    expect(screen.getByText('O que você pode fazer')).toBeVisible()
    expect(screen.getByText('Uma experiência pensada para diferentes telas')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('link', { name: 'Explorar publicações' })).toHaveAttribute('href', '/feed')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(container.textContent).not.toMatch(/@|token|comunidade global|líder de mercado/iu)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('uses the authenticated call to action when the session is available', () => {
    auth.state.isAuthenticated = true
    auth.state.status = 'authenticated'
    renderPage()

    expect(screen.getByRole('heading', { name: 'Compartilhe o que você está construindo' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Publicar projeto' })).toHaveAttribute('href', '/publicar')
    expect(screen.queryByRole('link', { name: 'Criar conta' })).not.toBeInTheDocument()
  })

  it('does not guess the primary action while the session is initializing', () => {
    auth.state.status = 'initializing'
    renderPage()

    expect(screen.queryByRole('link', { name: 'Criar conta' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Publicar projeto' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar publicações' })).toBeVisible()
  })

  it('updates and restores metadata without duplicating the description in StrictMode', () => {
    const previousTitle = document.title
    const existingDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const description = existingDescription ?? document.createElement('meta')
    if (!existingDescription) {
      description.name = 'description'
      document.head.append(description)
    }
    const previousDescription = description.content
    const { unmount } = render(<StrictMode><MemoryRouter><AboutPage /></MemoryRouter></StrictMode>)

    expect(document.title).toBe('Sobre nós | CodeConnect')
    expect(description.content).toBe('Conheça o CodeConnect, um espaço para descobrir, compartilhar e interagir com publicações sobre projetos.')
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1)

    unmount()
    expect(document.title).toBe(previousTitle)
    expect(description.content).toBe(previousDescription)
    if (!existingDescription) description.remove()
  })

  it('has no basic accessibility violations', async () => {
    const { container } = renderPage()
    expect(await axe(container)).toHaveNoViolations()
  })
})
