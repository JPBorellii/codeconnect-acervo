import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders its banner and content and hides decorative patterns', () => {
    const { container } = render(
      <AuthTemplate bannerAlt="Pessoa usando a CodeConnect" bannerSrc="/banner.png">
        <p>Conteúdo do painel</p>
      </AuthTemplate>,
    )

    expect(
      screen.getByRole('img', { name: 'Pessoa usando a CodeConnect' }),
    ).toHaveAttribute('src', '/banner.png')
    expect(screen.getByText('Conteúdo do painel')).toBeVisible()
    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2)
  })
})
