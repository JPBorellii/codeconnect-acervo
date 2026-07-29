import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '../../services/auth/auth.service'
import { ApiError } from '../../services/http/ApiError'
import { LoginPage } from './LoginPage'

vi.mock('../../services/auth/auth.service', () => ({
  authService: { getMe: vi.fn(), login: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function CurrentState() {
  return <div aria-label="Estado atual">{JSON.stringify(useLocation().state)}</div>
}

describe('LoginPage', () => {
  it('renders the normal login experience without a completion state', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeVisible()
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Senha')).toBeRequired()
    expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeDisabled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('announces registration completion, focuses it, and consumes navigation state', async () => {
    render(<MemoryRouter initialEntries={[{ pathname: '/login', state: { registrationComplete: true } }]}><LoginPage /><CurrentState /></MemoryRouter>)
    const status = await screen.findByText('Cadastro concluído. Faça login para continuar.')
    expect(status).toHaveTextContent('Cadastro concluído. Faça login para continuar.')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveFocus()
    expect(screen.getByLabelText('Estado atual')).toHaveTextContent('null')
  })

  it('has no accessibility violations with the completion message', async () => {
    const { container } = render(<MemoryRouter initialEntries={[{ pathname: '/login', state: { registrationComplete: true } }]}><LoginPage /></MemoryRouter>)
    expect(await axe(container)).toHaveNoViolations()
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
  })

  it('logs in, validates the received token, announces the public user, and clears password', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockResolvedValue({
      accessToken: 'secret-token', expiresIn: 3600, tokenType: 'Bearer',
      user: { id: 'login-user', name: 'Ignored', email: 'ada@example.com' },
    })
    vi.mocked(authService.getMe).mockResolvedValue({
      id: '1', name: 'Ada Lovelace', email: 'ada@example.com', createdAt: '2026-01-01',
    })
    render(<MemoryRouter><LoginPage /></MemoryRouter>)

    await user.type(screen.getByLabelText('Email'), ' ada@example.com ')
    await user.type(screen.getByLabelText('Senha'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(authService.login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'password1' })
    expect(authService.getMe).toHaveBeenCalledWith('secret-token')
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Login realizado com sucesso. Olá, Ada Lovelace.')
    expect(status).toHaveFocus()
    expect(screen.getByLabelText('Senha')).toHaveValue('')
    expect(window.localStorage.getItem('accessToken')).toBeNull()
    expect(window.sessionStorage.getItem('accessToken')).toBeNull()
  })

  it.each([
    [new ApiError('x', 'unauthorized', 401), 'Email ou senha inválidos.'],
    [new ApiError('x', 'network'), 'Não foi possível conectar ao servidor. Tente novamente.'],
    [new ApiError('x', 'timeout'), 'A solicitação demorou demais. Tente novamente.'],
    [new Error('x'), 'Não foi possível realizar o login. Tente novamente.'],
  ])('shows a safe login error', async (error, message) => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockRejectedValue(error)
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(message)
    expect(alert).toHaveFocus()
  })

  it('shows a session validation error when /auth/me is unauthorized', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockResolvedValue({
      accessToken: 'secret-token', expiresIn: 3600, tokenType: 'Bearer',
      user: { id: '1', name: 'Ada', email: 'ada@example.com' },
    })
    vi.mocked(authService.getMe).mockRejectedValue(new ApiError('x', 'unauthorized', 401))
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível validar sua sessão. Faça login novamente.')
  })

  it('disables a second attempt while login is pending', async () => {
    const user = userEvent.setup()
    let resolveLogin!: (value: { accessToken: string; expiresIn: number; tokenType: 'Bearer'; user: { id: string; name: string; email: string } }) => void
    vi.mocked(authService.login).mockReturnValue(new Promise((resolve) => { resolveLogin = resolve }))
    vi.mocked(authService.getMe).mockResolvedValue({
      id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01',
    })
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
    expect(authService.login).toHaveBeenCalledTimes(1)
    resolveLogin({ accessToken: 'token', expiresIn: 3600, tokenType: 'Bearer', user: { id: '1', name: 'Ada', email: 'ada@example.com' } })
    await screen.findByRole('status')
  })
})
