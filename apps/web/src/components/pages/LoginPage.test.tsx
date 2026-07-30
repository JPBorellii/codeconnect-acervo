import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../services/auth/AuthProvider'
import { authStorage } from '../../services/auth/auth-storage'
import { authService } from '../../services/auth/auth.service'
import { ApiError } from '../../services/http/ApiError'
import { LoginPage } from './LoginPage'

vi.mock('../../services/auth/auth.service', () => ({ authService: { getMe: vi.fn(), login: vi.fn() } }))

beforeEach(() => {
  vi.clearAllMocks()
  window.sessionStorage.clear()
})

function CurrentPath() {
  return <output aria-label="Rota atual">{useLocation().pathname}</output>
}

function renderLogin(entry: string | { pathname: string; state?: unknown } = '/login') {
  return render(<MemoryRouter initialEntries={[entry]}><AuthProvider><LoginPage /><CurrentPath /></AuthProvider></MemoryRouter>)
}

describe('LoginPage', () => {
  it('renders the normal login experience without a completion state', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Senha')).toBeRequired()
    expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
  })

  it('announces registration completion and consumes navigation state', async () => {
    renderLogin({ pathname: '/login', state: { registrationComplete: true } })
    expect(await screen.findByText('Cadastro concluído. Faça login para continuar.')).toBeVisible()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderLogin()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('stores the token only after validating /auth/me and redirects to feed', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockResolvedValue({ accessToken: 'secret-token', expiresIn: 3600, tokenType: 'Bearer', user: { id: '1', name: 'Ada', email: 'ada@example.com' } })
    vi.mocked(authService.getMe).mockResolvedValue({ id: '1', name: 'Ada Lovelace', email: 'ada@example.com', createdAt: '2026-01-01' })
    renderLogin()
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(authService.getMe).toHaveBeenCalledWith('secret-token')
    await waitFor(() => expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/feed'))
    expect(authStorage.getAccessToken()).toBe('secret-token')
  })

  it('redirects to the protected route originally requested', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockResolvedValue({ accessToken: 'token', expiresIn: 3600, tokenType: 'Bearer', user: { id: '1', name: 'Ada', email: 'ada@example.com' } })
    vi.mocked(authService.getMe).mockResolvedValue({ id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' })
    renderLogin({ pathname: '/login', state: { from: '/perfil' } })
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    await waitFor(() => expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/perfil'))
  })

  it.each([
    [new ApiError('x', 'unauthorized', 401), 'Email ou senha inválidos.'],
    [new ApiError('x', 'network'), 'Não foi possível conectar ao servidor. Tente novamente.'],
  ])('shows a safe error without storing a token', async (error, message) => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockRejectedValue(error)
    renderLogin()
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(authStorage.getAccessToken()).toBeNull()
    expect(screen.getByLabelText('Senha')).toHaveValue('')
  })

  it('disables a second attempt while login is pending', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockReturnValue(new Promise(() => {}))
    renderLogin()
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
  })
})
