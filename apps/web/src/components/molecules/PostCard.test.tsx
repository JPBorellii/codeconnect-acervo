import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PostCard } from './PostCard'

const post = { id: 'post-1', title: 'Projeto React', excerpt: 'Conteúdo do projeto.', thumbnailUrl: null, author: { id: 'user-1', name: 'Ada' }, commentCount: 2, likeCount: 3, createdAt: '2026-01-01T00:00:00.000Z' }

function renderCard(showAuthor = true) {
  return render(<MemoryRouter><PostCard post={post} showAuthor={showAuthor} /></MemoryRouter>)
}

describe('PostCard', () => {
  it('preserves the Feed card author, post links, fallback, counts, and accessibility by default', async () => {
    const { container } = renderCard()
    expect(screen.getByText('@Ada')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Abrir publicação: Projeto React' })).toHaveAttribute('href', '/posts/post-1')
    expect(screen.getByRole('img', { name: 'Post sem imagem de capa' })).toBeVisible()
    expect(screen.getByRole('group', { name: '3 curtidas e 2 comentários' })).toBeVisible()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('can hide the author for the authenticated profile without changing the post card links', () => {
    renderCard(false)
    expect(screen.queryByText('@Ada')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver publicação' })).toHaveAttribute('href', '/posts/post-1')
  })
})
