import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PublishPreview } from './PublishPreview'

describe('PublishPreview', () => {
  it('uses the CodeConnect fallback when no image URL is provided', () => {
    render(<PublishPreview authorName="Ada" content="" thumbnailUrl="" title="" />)
    expect(screen.getByRole('img', { name: 'Post sem imagem de capa' })).toBeVisible()
  })

  it('renders a valid HTTP(S) image and falls back when it fails', () => {
    render(<PublishPreview authorName="Ada" content="Conteúdo" thumbnailUrl="https://example.com/cover.png" title="Título" />)
    const image = screen.getByRole('img', { name: 'Prévia da imagem de capa' })
    expect(image).toHaveAttribute('src', 'https://example.com/cover.png')
    fireEvent.error(image)
    expect(screen.getByRole('img', { name: 'Post sem imagem de capa' })).toBeVisible()
  })

  it('does not render non-HTTP(S) URLs in the preview', () => {
    render(<PublishPreview authorName="Ada" content="" thumbnailUrl="javascript:alert(1)" title="" />)
    expect(screen.getByRole('img', { name: 'Post sem imagem de capa' })).toBeVisible()
  })
})
