import { describe, expect, it, vi } from 'vitest'
import { apiClient } from '../http/apiClient'
import { register } from './auth.service'

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
