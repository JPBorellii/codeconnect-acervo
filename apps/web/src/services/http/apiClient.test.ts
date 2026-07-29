import { describe, expect, it, vi } from 'vitest'
import { apiClient } from './apiClient'

describe('apiClient', () => {
  it('serializes JSON, uses the API URL, and returns valid JSON', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: '1' }), { status: 201 }),
    )

    await expect(apiClient('/auth/register', { body: { name: 'Ada' }, method: 'POST' })).resolves.toEqual({ id: '1' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
      body: JSON.stringify({ name: 'Ada' }),
      headers: expect.any(Headers),
      method: 'POST',
    }))
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Content-Type')).toBe('application/json')
  })

  it.each([[400, 'validation'], [409, 'conflict']] as const)(
    'maps HTTP %i to %s',
    async (status, category) => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status }))
      await expect(apiClient('/auth/register')).rejects.toMatchObject({ category, status })
    },
  )

  it('maps fetch failures to network errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('failed'))
    await expect(apiClient('/auth/register')).rejects.toMatchObject({ category: 'network' })
  })

  it('maps aborted requests to timeout errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'))
    await expect(apiClient('/auth/register')).rejects.toMatchObject({ category: 'timeout' })
  })

  it('safely rejects invalid JSON responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not json', { status: 200 }))
    await expect(apiClient('/auth/register')).rejects.toMatchObject({ category: 'unknown', status: 200 })
  })
})
