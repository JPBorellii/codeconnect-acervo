import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { StrictMode } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../services/auth/AuthProvider'
import { authStorage } from '../../services/auth/auth-storage'
import { PublishPage } from './PublishPage'

const createdPost = { id: 'post-42', title: 'Título válido', content: 'Conteúdo válido', thumbnailUrl: null, author: { id: 'user-1', name: 'Ada' }, commentCount: 0, likeCount: 0, createdAt: '2026-01-01T00:00:00.000Z' }

function Path() { return <output aria-label="Rota atual">{useLocation().pathname}</output> }
function LoginState() { const location = useLocation(); return <output aria-label="Login state">{JSON.stringify(location.state)}</output> }
function renderPage() {
  authStorage.setAccessToken('secret-token')
  return render(<MemoryRouter initialEntries={['/publicar']}><AuthProvider><Routes><Route element={<PublishPage />} path="/publicar" /><Route element={<Path />} path="/posts/:id" /><Route element={<LoginState />} path="/login" /></Routes></AuthProvider></MemoryRouter>)
}
function response(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status }) }
function fetchMock(postResponse: Promise<Response> | Response = response(createdPost, 201)) {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).endsWith('/auth/me')) return Promise.resolve(response({ id: 'user-1', name: 'Ada', email: 'ada@example.com', createdAt: '2026-01-01' }))
    if (String(input).endsWith('/posts') && init?.method === 'POST') return postResponse instanceof Promise ? postResponse : Promise.resolve(postResponse)
    return Promise.resolve(response({}))
  })
}

afterEach(() => { vi.unstubAllGlobals(); window.sessionStorage.clear() })

describe('PublishPage', () => {
  it('renders accessible fields and an empty non-link preview', async () => {
    vi.stubGlobal('fetch', fetchMock())
    const { container } = renderPage()
    expect(await screen.findByRole('textbox', { name: 'Título da publicação *' })).toHaveAttribute('id', 'publish-title')
    expect(screen.getByLabelText('Prévia da publicação')).toHaveTextContent('Título da publicação')
    expect(screen.queryByRole('link', { name: /prévia/i })).not.toBeInTheDocument()
    expect(screen.getByText('@Ada')).toBeVisible()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('validates, focuses the first invalid field, and updates counters', async () => {
    vi.stubGlobal('fetch', fetchMock())
    const user = userEvent.setup()
    renderPage()
    const title = await screen.findByRole('textbox', { name: 'Título da publicação *' })
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByText('Informe o título da publicação.')).toBeVisible()
    expect(title).toHaveFocus()
    await user.type(title, 'Oi')
    expect(screen.getByText('2 de 150 caracteres')).toBeVisible()
    await user.tab()
    expect(await screen.findByText('O título deve ter pelo menos 3 caracteres.')).toBeVisible()
  })

  it('submits only trimmed supported fields once and follows the returned id', async () => {
    const pending = Promise.resolve(response(createdPost, 201))
    const mock = fetchMock(pending)
    vi.stubGlobal('fetch', mock)
    const user = userEvent.setup()
    renderPage()
    await user.type(await screen.findByRole('textbox', { name: 'Título da publicação *' }), '  Título válido  ')
    await user.type(screen.getByRole('textbox', { name: 'Conteúdo *' }), '  Conteúdo válido  ')
    const publish = screen.getByRole('button', { name: 'Publicar' })
    await user.click(publish)
    await user.click(publish)
    await waitFor(() => expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/posts/post-42'))
    const call = mock.mock.calls.find(([url, init]) => String(url).endsWith('/posts') && init?.method === 'POST')
    expect(call?.[1]?.body).toBe(JSON.stringify({ title: 'Título válido', content: 'Conteúdo válido' }))
    expect(new Headers(call?.[1]?.headers).get('Authorization')).toBe('Bearer secret-token')
    expect(mock.mock.calls.filter(([url, init]) => String(url).endsWith('/posts') && init?.method === 'POST')).toHaveLength(1)
  })

  it('preserves entries after a temporary error and confirms discard', async () => {
    vi.stubGlobal('fetch', fetchMock(response({}, 500)))
    const user = userEvent.setup()
    renderPage()
    const title = await screen.findByRole('textbox', { name: 'Título da publicação *' })
    await user.type(title, 'Título válido')
    await user.type(screen.getByRole('textbox', { name: 'Conteúdo *' }), 'Conteúdo válido')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Não foi possível publicar agora')
    expect(title).toHaveValue('Título válido')
    await user.click(screen.getByRole('button', { name: 'Descartar' }))
    expect(screen.getByRole('dialog')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(title).toHaveValue('Título válido')
    await user.click(screen.getByRole('button', { name: 'Descartar' }))
    await user.click(screen.getAllByRole('button', { name: 'Descartar' })[1])
    expect(title).toHaveValue('')
  })

  it.each([401, 403])('clears the session and returns to login after HTTP %i', async (status) => {
    const mock = fetchMock(response({}, status))
    vi.stubGlobal('fetch', mock)
    const user = userEvent.setup()
    renderPage()
    await user.type(await screen.findByRole('textbox', { name: 'Título da publicação *' }), 'Título válido')
    await user.type(screen.getByRole('textbox', { name: 'Conteúdo *' }), 'Conteúdo válido')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByLabelText('Login state')).toHaveTextContent('/publicar')
    expect(authStorage.getAccessToken()).toBeNull()
    expect(mock.mock.calls.filter(([url, init]) => String(url).endsWith('/posts') && init?.method === 'POST')).toHaveLength(1)
    expect(document.body.textContent).not.toContain('secret-token')
  })

  it.each([{}, { id: '' }, { id: 42 }])('keeps the form for an invalid successful response', async (invalidResponse) => {
    vi.stubGlobal('fetch', fetchMock(response(invalidResponse, 201)))
    const user = userEvent.setup()
    renderPage()
    const title = await screen.findByRole('textbox', { name: 'Título da publicação *' })
    await user.type(title, 'Título válido')
    await user.type(screen.getByRole('textbox', { name: 'Conteúdo *' }), 'Conteúdo válido')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Não foi possível publicar agora')
    expect(title).toHaveValue('Título válido')
    expect(screen.queryByLabelText('Rota atual')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeEnabled()
  })

  it('registers and removes beforeunload exactly with dirty state and discard', async () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    vi.stubGlobal('fetch', fetchMock())
    const user = userEvent.setup()
    const view = renderPage()
    await screen.findByRole('textbox', { name: 'Título da publicação *' })
    expect(add.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(0)
    await user.type(screen.getByRole('textbox', { name: 'Título da publicação *' }), 'Título válido')
    expect(add.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Descartar' }))
    await user.click(screen.getAllByRole('button', { name: 'Descartar' })[1])
    expect(remove.mock.calls.filter(([type]) => type === 'beforeunload').length).toBeGreaterThan(0)
    view.unmount()
    add.mockRestore(); remove.mockRestore()
  })

  it('does not publish twice under StrictMode and releases the lock after an error', async () => {
    let rejectPost: ((reason?: unknown) => void) | undefined
    const pending = new Promise<Response>((_, reject) => { rejectPost = reject })
    const mock = fetchMock(pending)
    vi.stubGlobal('fetch', mock)
    authStorage.setAccessToken('secret-token')
    const user = userEvent.setup()
    render(<StrictMode><MemoryRouter initialEntries={['/publicar']}><AuthProvider><Routes><Route element={<PublishPage />} path="/publicar" /></Routes></AuthProvider></MemoryRouter></StrictMode>)
    await user.type(await screen.findByRole('textbox', { name: 'Título da publicação *' }), 'Título válido')
    await user.type(screen.getByRole('textbox', { name: 'Conteúdo *' }), 'Conteúdo válido')
    const publish = screen.getByRole('button', { name: 'Publicar' })
    await user.click(publish); await user.click(publish)
    expect(mock.mock.calls.filter(([url, init]) => String(url).endsWith('/posts') && init?.method === 'POST')).toHaveLength(1)
    expect(publish).toBeDisabled()
    rejectPost?.(new TypeError('offline'))
    await waitFor(() => expect(publish).toBeEnabled())
    await user.click(publish)
    expect(mock.mock.calls.filter(([url, init]) => String(url).endsWith('/posts') && init?.method === 'POST')).toHaveLength(2)
  })
})
