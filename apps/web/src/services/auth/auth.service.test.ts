import { describe, expect, it, vi } from 'vitest'
import { apiClient } from '../http/apiClient'
import { getMe, login, register } from './auth.service'

vi.mock('../http/apiClient', () => ({ apiClient: vi.fn() }))

describe('register', () => {
  it('posts the expected payload and returns the public user', async () => {
    const user = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' }
    vi.mocked(apiClient).mockResolvedValue(user)

    await expect(register({ name: 'Ada', email: 'ada@example.com', password: 'password1' })).resolves.toEqual(user)
    expect(apiClient).toHaveBeenCalledWith('/auth/register', {
      body: { name: 'Ada', email: 'ada@example.com', password: 'password1' },
      method: 'POST',
    })
  })
})

describe('login', () => {
  it('posts only email and password and returns the typed login response', async () => {
    const response = {
      accessToken: 'token', expiresIn: 3600, tokenType: 'Bearer' as const,
      user: { id: '1', name: 'Ada', email: 'ada@example.com' },
    }
    vi.mocked(apiClient).mockResolvedValue(response)

    await expect(login({ email: 'ada@example.com', password: 'password1' })).resolves.toEqual(response)
    expect(apiClient).toHaveBeenCalledWith('/auth/login', {
      body: { email: 'ada@example.com', password: 'password1' }, method: 'POST',
    })
  })

  it('gets the public user with a Bearer Authorization header and never puts the token in the URL', async () => {
    const user = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' }
    vi.mocked(apiClient).mockResolvedValue(user)

    await expect(getMe('token')).resolves.toEqual(user)
    expect(apiClient).toHaveBeenCalledWith('/auth/me', {
      cache: 'no-store',
      headers: { Authorization: 'Bearer token' }, method: 'GET',
    })
    expect(vi.mocked(apiClient).mock.calls[0][0]).not.toContain('token')
  })
})
