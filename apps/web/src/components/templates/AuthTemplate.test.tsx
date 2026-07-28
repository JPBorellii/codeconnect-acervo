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
    expect(container.querySelector('main')).toHaveClass(
      'items-center',
      'overflow-hidden',
    )
    expect(container.querySelector('main > div.grid')).toHaveClass(
      'xl:-translate-y-[76px]',
    )
  })

  it('uses optional cadastro assets without changing the default API', () => {
    const { container } = render(
      <AuthTemplate
        bannerAlt="Pessoa usando a CodeConnect"
        bannerLogoSrc="/logo.png"
        bannerSrc="/cadastro.png"
        patternBottomSrc="/bottom.png"
        patternTopSrc="/top.png"
        variant="cadastro"
      >
        <p>Cadastro</p>
      </AuthTemplate>,
    )

    expect(
      screen.getByRole('img', { name: 'Pessoa usando a CodeConnect' }),
    ).toHaveAttribute('src', '/cadastro.png')
    expect(screen.getByRole('img', { name: 'CodeConnect' })).toHaveAttribute(
      'src',
      '/logo.png',
    )
    expect(container.querySelector('img[src="/top.png"]')).toBeInTheDocument()
    expect(container.querySelector('img[src="/bottom.png"]')).toBeInTheDocument()
    expect(container.querySelector('main')).toHaveClass(
      'items-start',
      'overflow-y-auto',
    )
    expect(container.querySelector('main > div.grid')).not.toHaveClass(
      'xl:-translate-y-[58px]',
    )
  })
})
