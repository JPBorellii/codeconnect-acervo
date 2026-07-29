import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { CadastroPage } from './CadastroPage'

describe('CadastroPage', () => {
  it('renders cadastro without enabling authentication integrations', () => {
    render(
      <MemoryRouter>
        <CadastroPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeVisible()
    expect(screen.getByLabelText('Nome')).toBeRequired()
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Senha')).toBeRequired()
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeEnabled()
    const sources = document.querySelectorAll('picture > source')

    expect(sources).toHaveLength(2)
    expect(sources[0]).toHaveAttribute('type', 'image/avif')
    expect(sources[0]).toHaveAttribute('srcset', '/banner-cadastro.avif')
    expect(sources[1]).toHaveAttribute('type', 'image/webp')
    expect(sources[1]).toHaveAttribute('srcset', '/banner-cadastro.webp')
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeDisabled()
    expect(
      screen.getByRole('link', { name: 'Faça seu login!' }),
    ).toHaveAttribute('href', '/login')
  })
  it('has no accessibility violations after empty submission', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <CadastroPage />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await axe(container)).toHaveNoViolations()
  })
})
