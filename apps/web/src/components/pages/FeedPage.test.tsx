import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FeedPage } from './FeedPage'
import { AuthProvider } from '../../services/auth/AuthProvider'

const post = { id: 'post-1', title: 'Post React', excerpt: 'Conteúdo sobre React e acessibilidade.', thumbnailUrl: null, author: { id: 'author-1', name: 'ana' }, commentCount: 3, likeCount: 5, createdAt: '2026-01-01T00:00:00.000Z' }
const success = { items: [post], meta: { page: 1, limit: 12, total: 1, totalPages: 1 } }

function renderPage() { return render(<MemoryRouter><AuthProvider><FeedPage /></AuthProvider></MemoryRouter>) }

afterEach(() => vi.unstubAllGlobals())

describe('FeedPage', () => {
  it('renders loading then posts from the public API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(success), { headers: { 'content-type': 'application/json' } })))
    renderPage()
    expect(screen.getByRole('status')).toHaveTextContent('Carregando posts')
    expect(await screen.findByRole('heading', { name: 'Post React' })).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/posts?limit=12&page=1', expect.any(Object))
  })

  it('shows empty and error states', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ ...success, items: [] }), { headers: { 'content-type': 'application/json' } })).mockResolvedValueOnce(new Response('', { status: 500 })))
    const { unmount } = renderPage()
    expect(await screen.findByText('Nenhum post encontrado.')).toBeVisible()
    unmount()
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os posts.')
  })

  it('searches, clears filters, and links visitors to login', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(success), { headers: { 'content-type': 'application/json' } })))
    renderPage()
    await screen.findByRole('heading', { name: 'Post React' })
    await user.type(screen.getByRole('searchbox'), 'React')
    expect(await screen.findByDisplayValue('React')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Limpar tudo' }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.getAllByRole('link', { name: 'Publicar' })[0]).toHaveAttribute('href', '/login')
  })

  it('has no basic accessibility violations', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(success), { headers: { 'content-type': 'application/json' } })))
    const { container } = renderPage()
    await screen.findByRole('heading', { name: 'Post React' })
    expect(await axe(container)).toHaveNoViolations()
  })
})
