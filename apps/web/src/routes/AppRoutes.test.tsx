import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { authStorage } from '../services/auth/auth-storage'
import { authService } from '../services/auth/auth.service'
import { AppRoutes } from './AppRoutes'

vi.mock('../services/auth/auth.service', () => ({ authService: { getMe: vi.fn(), login: vi.fn() } }))

function CurrentPath() {
  return <output aria-label="Rota atual">{useLocation().pathname}</output>
}

function CurrentState() {
  return <output aria-label="Estado atual">{JSON.stringify(useLocation().state)}</output>
}

function renderRoutes(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <CurrentPath />
      <CurrentState />
    </MemoryRouter>,
  )
}

describe('AppRoutes', () => {
  it('renders LoginPage at /login', () => {
    renderRoutes('/login')
    expect(screen.getByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/login')
  })

  it('redirects / to /feed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } }))))
    renderRoutes('/')
    expect(await screen.findByRole('heading', { name: 'Feed público' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/feed')
  })

  it('renders CadastroPage at /cadastro', () => {
    renderRoutes('/cadastro')
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/cadastro')
  })

  it('renders the public about page without requesting a session or redirecting', () => {
    renderRoutes('/sobre')
    expect(screen.getByRole('heading', { name: 'Projetos, pessoas e ideias em conexão.' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/sobre')
  })

  it('navigates from login to cadastro and back to login', async () => {
    const user = userEvent.setup()
    renderRoutes('/login')

    await user.click(screen.getByRole('link', { name: 'Crie seu cadastro!' }))
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/cadastro')

    await user.click(screen.getByRole('link', { name: 'Faça seu login!' }))
    expect(screen.getByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/login')
  })

  it('redirects visitors from protected routes and preserves their origin', async () => {
    renderRoutes('/perfil')
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/login')
    expect(screen.getByLabelText('Estado atual')).toHaveTextContent('/perfil')
  })

  it('renders the publish form after restoring a valid session', async () => {
    authStorage.setAccessToken('saved-token')
    vi.mocked(authService.getMe).mockResolvedValue({ id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' })
    renderRoutes('/publicar')
    expect(await screen.findByRole('heading', { name: 'Nova publicação' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Título da publicação *' })).toBeVisible()
  })

  it('renders the profile page after restoring a valid session', async () => {
    authStorage.setAccessToken('saved-token')
    vi.mocked(authService.getMe).mockResolvedValue({ id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } }), { headers: { 'content-type': 'application/json' } })))
    renderRoutes('/perfil')
    expect(await screen.findByRole('heading', { name: 'Ada' })).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/profile/me/posts?page=1&limit=12', expect.any(Object))
  })
})
