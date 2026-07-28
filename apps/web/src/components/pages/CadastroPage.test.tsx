import { render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Google' })).toBeDisabled()
    expect(
      screen.getByRole('link', { name: 'Faça seu login!' }),
    ).toHaveAttribute('href', '/login')
  })
})
