import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renders the complete login experience with cadastro navigation', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeVisible()
    expect(screen.getByLabelText('Email ou usuário')).toBeRequired()
    expect(screen.getByLabelText('Senha')).toBeRequired()
    expect(
      screen.getByRole('link', { name: 'Crie seu cadastro!' }),
    ).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeDisabled()
    const sources = document.querySelectorAll('picture > source')

    expect(sources[0]).toHaveAttribute('type', 'image/avif')
    expect(sources[0]).toHaveAttribute(
      'srcset',
      '/banner-login-407.avif 407w, /banner-login-814.avif 814w',
    )
    expect(sources[0]).toHaveAttribute(
      'sizes',
      '(max-width: 639px) calc(100vw - 64px), (max-width: 1023px) calc(100vw - 112px), 407px',
    )
    expect(sources[1]).toHaveAttribute('type', 'image/webp')
    expect(sources[1]).toHaveAttribute(
      'srcset',
      '/banner-login-407.webp 407w, /banner-login-814.webp 814w',
    )
  })
  it('has no accessibility violations after empty submission', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(await axe(container)).toHaveNoViolations()
  })
})
