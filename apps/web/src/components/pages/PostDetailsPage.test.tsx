import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../services/auth/AuthProvider'
import { authStorage } from '../../services/auth/auth-storage'
import { PostDetailsPage } from './PostDetailsPage'

const postId = '984b6404-884c-4a54-8b89-40850fc48e1d'
const post = { id: postId, title: 'Post completo', content: 'Conteúdo seguro\n\n```ts\nconst ok = true\n```', thumbnailUrl: null, author: { id: 'author-1', name: 'ana' }, commentCount: 1, likeCount: 2, createdAt: '2026-01-01T00:00:00.000Z' }
const comments = { items: [{ id: 'comment-1', content: 'Excelente!', createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z', author: { id: 'author-2', name: 'bia' } }], meta: { page: 1, limit: 12, total: 1, totalPages: 1 } }

function CurrentPath() { const location = useLocation(); return <output aria-label="Rota atual">{JSON.stringify({ path: location.pathname, state: location.state })}</output> }
function renderPage(path = `/posts/${postId}`) {
  return render(<MemoryRouter initialEntries={[path]}><AuthProvider><Routes><Route element={<PostDetailsPage />} path="/posts/:id" /><Route element={<p>Login</p>} path="/login" /></Routes><CurrentPath /></AuthProvider></MemoryRouter>)
}

afterEach(() => vi.unstubAllGlobals())

function response(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status }) }

function authenticatedFetch(liked = false) {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/auth/me')) return Promise.resolve(response({ id: 'user-1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' }))
    if (url.endsWith(`/posts/${postId}`)) return Promise.resolve(response(post))
    if (url.includes('/comments?')) return Promise.resolve(response(comments))
    if (url.endsWith('/comments') && init?.method === 'POST') return Promise.resolve(response({ id: 'comment-2', content: 'Novo comentário', createdAt: '2026-01-03T00:00:00.000Z', updatedAt: '2026-01-03T00:00:00.000Z', author: { id: 'user-1', name: 'Ada' } }, 201))
    if (url.endsWith('/like')) {
      if (init?.method === 'PUT') return Promise.resolve(response({ liked: true, likeCount: 3 }))
      if (init?.method === 'DELETE') return Promise.resolve(response({ liked: false, likeCount: 2 }))
      return Promise.resolve(response({ liked, likeCount: 2 }))
    }
    return Promise.resolve(response({}))
  })
}

describe('PostDetailsPage', () => {
  it('loads public post and comments without waiting for authentication', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(post))).mockResolvedValueOnce(new Response(JSON.stringify(comments))))
    const { container } = renderPage()
    expect(await screen.findByRole('heading', { name: 'Post completo' })).toBeVisible()
    expect(await screen.findByText('@bia')).toBeVisible()
    expect(fetch).toHaveBeenCalledWith(`/api/posts/${postId}`, expect.any(Object))
    expect(fetch).toHaveBeenCalledWith(`/api/posts/${postId}/comments?page=1&limit=12`, expect.any(Object))
    expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/like'))).toBe(false)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows a friendly state for an invalid identifier', () => {
    renderPage('/posts/not-a-uuid')
    expect(screen.getByRole('heading', { name: 'Publicação inválida' })).toBeVisible()
  })

  it('sends visitors to login before liking', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(post))).mockResolvedValueOnce(new Response(JSON.stringify(comments))))
    renderPage()
    await screen.findByRole('heading', { name: 'Post completo' })
    await user.click(screen.getByRole('button', { name: 'Curtir publicação' }))
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent(`"from":"/posts/${postId}"`)
  })

  it('distinguishes an unavailable post from a missing post and retries temporary failures', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({}, 404))
      .mockResolvedValueOnce(response({}, 500))
      .mockResolvedValueOnce(response(post))
      .mockResolvedValueOnce(response(comments))
    vi.stubGlobal('fetch', fetchMock)
    const first = renderPage()
    expect(await screen.findByRole('heading', { name: 'Publicação não encontrada' })).toBeVisible()
    first.unmount()
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Não foi possível carregar a publicação' })).toBeVisible()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Post completo' })).toBeVisible()
  })

  it('queries and updates the authenticated like state using PUT and DELETE', async () => {
    authStorage.setAccessToken('secret-token')
    const fetchMock = authenticatedFetch(false)
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByRole('button', { name: 'Curtir publicação' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Curtir publicação' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Remover curtida' })).toHaveTextContent('3'))
    await user.click(screen.getByRole('button', { name: 'Remover curtida' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Curtir publicação' })).toHaveTextContent('2'))
    const likeCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/like'))
    expect(likeCalls.map(([, init]) => init?.method)).toEqual([undefined, 'PUT', 'DELETE'])
    expect(new Headers(likeCalls[0][1]?.headers).get('Authorization')).toBe('Bearer secret-token')
  })

  it('posts only trimmed content and updates the visible comment count', async () => {
    authStorage.setAccessToken('secret-token')
    const fetchMock = authenticatedFetch()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderPage()
    const field = await screen.findByRole('textbox', { name: 'Escreva um comentário' })
    await user.type(field, '  Novo comentário  ')
    await user.click(screen.getByRole('button', { name: 'Comentar' }))
    await screen.findByText('@Ada')
    const commentCall = fetchMock.mock.calls.find(([url, init]) => String(url).endsWith('/comments') && init?.method === 'POST')
    expect(commentCall).toBeDefined()
    expect(commentCall?.[1]?.body).toBe(JSON.stringify({ content: 'Novo comentário' }))
    expect(screen.getByLabelText('2 curtidas e 2 comentários')).toBeVisible()
  })

  it('preserves a comment after a submission error', async () => {
    authStorage.setAccessToken('secret-token')
    const fetchMock = authenticatedFetch()
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith('/comments') && init?.method === 'POST') return Promise.reject(new TypeError('offline'))
      if (String(input).endsWith('/auth/me')) return Promise.resolve(response({ id: 'user-1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' }))
      if (String(input).endsWith(`/posts/${postId}`)) return Promise.resolve(response(post))
      if (String(input).includes('/comments?')) return Promise.resolve(response(comments))
      if (String(input).endsWith('/like')) return Promise.resolve(response({ liked: false, likeCount: 2 }))
      return Promise.resolve(response({}))
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderPage()
    const field = await screen.findByRole('textbox', { name: 'Escreva um comentário' })
    await user.type(field, 'Manter este texto')
    await user.click(screen.getByRole('button', { name: 'Comentar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível enviar seu comentário')
    expect(field).toHaveValue('Manter este texto')
  })

  it('prevents a second comment request while the first is pending', async () => {
    authStorage.setAccessToken('secret-token')
    let resolveComment: ((value: Response) => void) | undefined
    const pendingComment = new Promise<Response>((resolve) => { resolveComment = resolve })
    const fetchMock = authenticatedFetch()
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith('/comments') && init?.method === 'POST') return pendingComment
      if (String(input).endsWith('/auth/me')) return Promise.resolve(response({ id: 'user-1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' }))
      if (String(input).endsWith(`/posts/${postId}`)) return Promise.resolve(response(post))
      if (String(input).includes('/comments?')) return Promise.resolve(response(comments))
      if (String(input).endsWith('/like')) return Promise.resolve(response({ liked: false, likeCount: 2 }))
      return Promise.resolve(response({}))
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderPage()
    await user.type(await screen.findByRole('textbox', { name: 'Escreva um comentário' }), 'Único envio')
    const submit = screen.getByRole('button', { name: 'Comentar' })
    await user.click(submit)
    await user.click(submit)
    expect(fetchMock.mock.calls.filter(([url, init]) => String(url).endsWith('/comments') && init?.method === 'POST')).toHaveLength(1)
    resolveComment?.(response({ id: 'comment-2', content: 'Único envio', createdAt: '2026-01-03T00:00:00.000Z', updatedAt: '2026-01-03T00:00:00.000Z', author: { id: 'user-1', name: 'Ada' } }, 201))
  })

  it('replaces comments when changing pages instead of duplicating them', async () => {
    const pageTwo = { items: [comments.items[0]], meta: { page: 2, limit: 12, total: 13, totalPages: 2 } }
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith(`/posts/${postId}`)) return Promise.resolve(response(post))
      if (url.includes('page=1')) return Promise.resolve(response({ ...comments, meta: { ...comments.meta, total: 13, totalPages: 2 } }))
      return Promise.resolve(response(pageTwo))
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('@bia')
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    await waitFor(() => expect(screen.getByText('Página 2 de 2')).toBeVisible())
    expect(screen.getAllByText('@bia')).toHaveLength(1)
  })

  it('shares a URL without query values such as tokens', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(post)).mockResolvedValueOnce(response(comments)))
    const user = userEvent.setup()
    window.history.replaceState({}, '', `/posts/${postId}?token=secret-token`)
    renderPage()
    await user.click(await screen.findByRole('button', { name: '↗ Compartilhar' }))
    await waitFor(() => expect(share).toHaveBeenCalledWith({ title: post.title, url: `${window.location.origin}/posts/${postId}` }))
  })
})
