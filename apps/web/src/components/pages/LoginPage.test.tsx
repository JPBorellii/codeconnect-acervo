import { render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('button', { name: 'Google' })).toBeDisabled()
  })
})
