import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders modern banner sources, the PNG fallback, and content', () => {
    const { container } = render(
      <AuthTemplate
        banner={{
          avif: { srcSet: '/banner.avif 407w, /banner@2x.avif 814w' },
          fallbackSrc: '/banner.png',
          height: 1272,
          webp: { srcSet: '/banner.webp 407w, /banner@2x.webp 814w' },
          width: 814,
        }}
        bannerAlt="Pessoa usando a CodeConnect"
      >
        <p>Conteúdo do painel</p>
      </AuthTemplate>,
    )

    const banner = screen.getByRole('img', {
      name: 'Pessoa usando a CodeConnect',
    })
    const sources = container.querySelectorAll('picture > source')

    expect(sources[0]).toHaveAttribute('type', 'image/avif')
    expect(sources[0]).toHaveAttribute(
      'srcset',
      '/banner.avif 407w, /banner@2x.avif 814w',
    )
    expect(sources[1]).toHaveAttribute('type', 'image/webp')
    expect(sources[1]).toHaveAttribute(
      'srcset',
      '/banner.webp 407w, /banner@2x.webp 814w',
    )
    expect(banner).toHaveAttribute('src', '/banner.png')
    expect(banner).toHaveAttribute('width', '814')
    expect(banner).toHaveAttribute('height', '1272')
    expect(banner).toHaveClass('object-cover', 'object-[center_42%]')
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

  it('uses one source per modern format for cadastro', () => {
    const { container } = render(
      <AuthTemplate
        banner={{
          avif: { srcSet: '/cadastro.avif' },
          fallbackSrc: '/cadastro.png',
          height: 675,
          webp: { srcSet: '/cadastro.webp' },
          width: 407,
        }}
        bannerAlt="Pessoa usando a CodeConnect"
        bannerLogoSrc="/logo.png"
        patternBottomSrc="/bottom.png"
        patternTopSrc="/top.png"
        variant="cadastro"
      >
        <p>Cadastro</p>
      </AuthTemplate>,
    )

    const banner = screen.getByRole('img', {
      name: 'Pessoa usando a CodeConnect',
    })
    const sources = container.querySelectorAll('picture > source')

    expect(sources).toHaveLength(2)
    expect(sources[0]).toHaveAttribute('type', 'image/avif')
    expect(sources[0]).toHaveAttribute('srcset', '/cadastro.avif')
    expect(sources[1]).toHaveAttribute('type', 'image/webp')
    expect(sources[1]).toHaveAttribute('srcset', '/cadastro.webp')
    expect(banner).toHaveAttribute('src', '/cadastro.png')
    expect(banner).toHaveAttribute('width', '407')
    expect(banner).toHaveAttribute('height', '675')
    expect(banner).toHaveClass('object-cover', 'lg:object-center')
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
