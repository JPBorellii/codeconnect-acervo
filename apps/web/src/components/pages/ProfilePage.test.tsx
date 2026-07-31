import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthorizedRequest } from '../../services/auth/auth-context'
import { ApiError } from '../../services/http/ApiError'
import { memberSince, profileInitials } from '../../features/profile/profile.presentation'
import { ProfilePage } from './ProfilePage'

const profileUser = { id: 'private-id', name: 'João Paulo', email: 'joao@example.com', createdAt: '2026-07-01T00:00:00.000Z' }
const post = { id: 'post-1', title: 'Projeto real', excerpt: 'Conteúdo real', thumbnailUrl: null, author: { id: 'private-id', name: 'João Paulo' }, commentCount: 2, likeCount: 3, createdAt: '2026-07-01T00:00:00.000Z' }
const pageOne = { items: [post], meta: { page: 1, limit: 12, total: 3, totalPages: 2 } }

function renderPage(authorizedRequest: AuthorizedRequest) {
  return render(<MemoryRouter><AuthContext.Provider value={{ authorizedRequest, isAuthenticated: true, login: vi.fn(), logout: vi.fn(), refreshCurrentUser: vi.fn(), status: 'authenticated', user: profileUser }}><ProfilePage /></AuthContext.Provider></MemoryRouter>)
}

afterEach(() => vi.clearAllMocks())

describe('ProfilePage', () => {
  it('renders real profile data, the backend total, and an accessible post card', async () => {
    const request = vi.fn().mockResolvedValue(pageOne)
    const { container } = renderPage(request)
    expect(await screen.findByRole('heading', { name: 'João Paulo' })).toBeVisible()
    expect(screen.getByLabelText('Avatar de João Paulo')).toHaveTextContent('JP')
    expect(screen.getByText('Membro desde julho de 2026')).toBeVisible()
    expect(screen.getByText('3 publicações')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Abrir publicação: Projeto real' })).toHaveAttribute('href', '/posts/post-1')
    expect(document.body.textContent).not.toContain(profileUser.email)
    expect(document.body.textContent).not.toContain(profileUser.id)
    expect(document.body.textContent).not.toContain('@João Paulo')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the empty-state action', async () => {
    renderPage(vi.fn().mockResolvedValue({ items: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } }))
    expect(await screen.findByText('Você ainda não publicou nenhum projeto.')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Publicar projeto' })).toHaveAttribute('href', '/publicar')
  })

  it('does not present zero publications before a valid response', async () => {
    renderPage(vi.fn().mockRejectedValue(new Error('offline')))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.getByText('Publicações indisponíveis')).toBeVisible()
    expect(screen.queryByText('0 publicações')).not.toBeInTheDocument()
  })

  it('retries an initial error and preserves previous items on an additional-page error', async () => {
    const request = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(pageOne).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ items: [{ ...post, id: 'post-2', title: 'Segundo projeto' }], meta: { page: 2, limit: 12, total: 3, totalPages: 2 } })
    const user = userEvent.setup()
    renderPage(request)
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as publicações.')
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Projeto real' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Carregar mais' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar mais publicações')
    expect(screen.getByRole('heading', { name: 'Projeto real' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Carregar mais' }))
    expect(await screen.findByRole('heading', { name: 'Segundo projeto' })).toBeVisible()
  })

  it('deduplicates posts and prevents duplicate additional-page requests', async () => {
    let resolvePage: ((value: typeof pageOne) => void) | undefined
    const second = new Promise<typeof pageOne>((resolve) => { resolvePage = resolve })
    const request = vi.fn().mockResolvedValueOnce(pageOne).mockReturnValueOnce(second)
    const user = userEvent.setup()
    renderPage(request)
    await screen.findByRole('heading', { name: 'Projeto real' })
    const more = screen.getByRole('button', { name: 'Carregar mais' })
    await user.click(more); await user.click(more)
    expect(request).toHaveBeenCalledTimes(2)
    resolvePage?.({ items: [post], meta: { page: 2, limit: 12, total: 3, totalPages: 2 } })
    await waitFor(() => expect(screen.getAllByRole('heading', { name: 'Projeto real' })).toHaveLength(1))
  })

  it('does not expose private posts after a session error', async () => {
    const request = vi.fn().mockRejectedValue(new ApiError('Não autorizado.', 'unauthorized', 401))
    renderPage(request)
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.queryByText('Projeto real')).not.toBeInTheDocument()
  })

  it('keeps a safe initial load under StrictMode', async () => {
    const request = vi.fn().mockResolvedValue(pageOne)
    render(<StrictMode><MemoryRouter><AuthContext.Provider value={{ authorizedRequest: request, isAuthenticated: true, login: vi.fn(), logout: vi.fn(), refreshCurrentUser: vi.fn(), status: 'authenticated', user: profileUser }}><ProfilePage /></AuthContext.Provider></MemoryRouter></StrictMode>)
    expect(await screen.findByRole('heading', { name: 'Projeto real' })).toBeVisible()
  })
})

describe('profile presentation helpers', () => {
  it('creates safe initials and a stable member date', () => {
    expect(profileInitials(' João   Paulo ')).toBe('JP')
    expect(profileInitials('Maria')).toBe('M')
    expect(profileInitials('   ')).toBe('?')
    expect(memberSince('2026-07-01T00:00:00.000Z')).toBe('Membro desde julho de 2026')
    expect(memberSince('invalid')).toBe('Membro desde data não informada')
  })
})
