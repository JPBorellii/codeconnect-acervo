import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '../../services/auth/auth.service'
import { ApiError } from '../../services/http/ApiError'
import { CadastroPage } from './CadastroPage'

vi.mock('../../services/auth/auth.service', () => ({ authService: { register: vi.fn() } }))

function CurrentPath() {
  return <output aria-label="Rota atual">{useLocation().pathname}</output>
}

async function submitValidForm() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nome'), 'Ada Lovelace')
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.type(screen.getByLabelText('Senha'), 'password1')
  await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
  return user
}

describe('CadastroPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders cadastro and retains its visual-only controls', () => {
    render(<MemoryRouter><CadastroPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeVisible()
    expect(screen.getByLabelText('Nome')).toBeRequired()
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Senha')).toBeRequired()
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/login')
    const sources = document.querySelectorAll('picture > source')
    expect(sources).toHaveLength(2)
    expect(sources[0]).toHaveAttribute('srcset', '/banner-cadastro.avif')
    expect(sources[1]).toHaveAttribute('srcset', '/banner-cadastro.webp')
  })

  it('has no accessibility violations after empty submission', async () => {
    const { container } = render(<MemoryRouter><CadastroPage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('registers valid data without sending rememberMe and navigates to login', async () => {
    vi.mocked(authService.register).mockResolvedValue({ id: '1', name: 'Ada Lovelace', email: 'ada@example.com', createdAt: '2026-01-01' })
    render(<MemoryRouter initialEntries={['/cadastro']}><CadastroPage /><CurrentPath /></MemoryRouter>)
    await submitValidForm()
    expect(authService.register).toHaveBeenCalledWith({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'password1' })
    await waitFor(() => expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/login'))
  })

  it.each([
    [new ApiError('', 'validation', 400), 'Revise os dados informados.'],
    [new ApiError('', 'conflict', 409), 'Este email já está cadastrado.'],
    [new ApiError('', 'network'), 'Não foi possível conectar ao servidor. Tente novamente.'],
    [new ApiError('', 'timeout'), 'A solicitação demorou demais. Tente novamente.'],
  ])('shows a safe submission error', async (error, message) => {
    vi.mocked(authService.register).mockRejectedValue(error)
    const { container } = render(<MemoryRouter><CadastroPage /></MemoryRouter>)
    await submitValidForm()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(message)
    await waitFor(() => expect(alert).toHaveFocus())
    expect(await axe(container)).toHaveNoViolations()
  })

  it('disables submission and prevents repeat requests while registering', async () => {
    let resolveRegister: (value: { id: string; name: string; email: string; createdAt: string }) => void = () => undefined
    vi.mocked(authService.register).mockReturnValue(new Promise((resolve) => { resolveRegister = resolve }))
    render(<MemoryRouter><CadastroPage /></MemoryRouter>)
    const user = await submitValidForm()
    expect(screen.getByRole('button', { name: 'Cadastrando...' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Cadastrando...' }))
    expect(authService.register).toHaveBeenCalledTimes(1)
    resolveRegister({ id: '1', name: 'Ada Lovelace', email: 'ada@example.com', createdAt: '2026-01-01' })
  })
})
