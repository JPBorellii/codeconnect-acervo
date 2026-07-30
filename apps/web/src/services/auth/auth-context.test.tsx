import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthProvider'
import { accessTokenKey, authStorage } from './auth-storage'
import { authService } from './auth.service'
import { useAuth } from './use-auth'

vi.mock('./auth.service', () => ({ authService: { getMe: vi.fn(), login: vi.fn() } }))

const currentUser = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' }

function AuthState() {
  const { isAuthenticated, login, logout, status, user } = useAuth()
  return <>
    <output aria-label="auth-state">{JSON.stringify({ isAuthenticated, status, user })}</output>
    <button onClick={() => void login({ email: 'ada@example.com', password: 'password1' })} type="button">Entrar</button>
    <button onClick={logout} type="button">Sair</button>
  </>
}

function renderProvider() {
  return render(<MemoryRouter><AuthProvider><AuthState /></AuthProvider></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe('AuthProvider', () => {
  it('initializes as anonymous without a token', async () => {
    renderProvider()
    await waitFor(() => expect(screen.getByLabelText('auth-state')).toHaveTextContent('"anonymous"'))
    expect(authService.getMe).not.toHaveBeenCalled()
  })

  it('restores a valid token and sends it to /auth/me', async () => {
    authStorage.setAccessToken('saved-token')
    vi.mocked(authService.getMe).mockResolvedValue(currentUser)
    renderProvider()
    await waitFor(() => expect(screen.getByLabelText('auth-state')).toHaveTextContent('"authenticated"'))
    expect(authService.getMe).toHaveBeenCalledTimes(1)
    expect(authService.getMe).toHaveBeenCalledWith('saved-token')
  })

  it('removes an invalid token and becomes anonymous', async () => {
    authStorage.setAccessToken('bad-token')
    vi.mocked(authService.getMe).mockRejectedValue(new Error('unauthorized'))
    renderProvider()
    await waitFor(() => expect(screen.getByLabelText('auth-state')).toHaveTextContent('"anonymous"'))
    expect(window.sessionStorage.getItem(accessTokenKey)).toBeNull()
  })

  it('keeps the session when the provider is recreated', async () => {
    authStorage.setAccessToken('saved-token')
    vi.mocked(authService.getMe).mockResolvedValue(currentUser)
    const first = renderProvider()
    await waitFor(() => expect(screen.getByLabelText('auth-state')).toHaveTextContent('"authenticated"'))
    first.unmount()
    renderProvider()
    await waitFor(() => expect(screen.getByLabelText('auth-state')).toHaveTextContent('"authenticated"'))
  })

  it('removes the local session on logout', async () => {
    authStorage.setAccessToken('saved-token')
    vi.mocked(authService.getMe).mockResolvedValue(currentUser)
    const user = userEvent.setup()
    renderProvider()
    await waitFor(() => expect(screen.getByLabelText('auth-state')).toHaveTextContent('"authenticated"'))
    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(authStorage.getAccessToken()).toBeNull()
    expect(screen.getByLabelText('auth-state')).toHaveTextContent('"anonymous"')
  })
})
