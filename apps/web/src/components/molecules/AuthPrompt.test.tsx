import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthPrompt } from './AuthPrompt'

describe('AuthPrompt', () => {
  it('renders an unavailable action as text', () => {
    render(<AuthPrompt action="Crie seu cadastro!" message="Ainda não tem conta?" />)
    expect(screen.getByText('Crie seu cadastro!')).not.toHaveRole('link')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders a link when a real destination is provided', () => {
    render(
      <MemoryRouter>
        <AuthPrompt action="Faça login" destination="/login" message="Já tem conta?" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Faça login' })).toHaveAttribute(
      'href',
      '/login',
    )
  })
})
