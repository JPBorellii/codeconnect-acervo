import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('renders required fields with the correct autocomplete attributes', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    const identity = screen.getByLabelText('Email ou usuário')
    const password = screen.getByLabelText('Senha')
    expect(identity).toBeRequired()
    expect(identity).toHaveAttribute('autocomplete', 'username')
    expect(password).toBeRequired()
    expect(password).toHaveAttribute('autocomplete', 'current-password')
  })

  it('toggles remember-me and submits normalized values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email ou usuário'), '  pessoa  ')
    await user.type(screen.getByLabelText('Senha'), 'segredo')
    await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(onSubmit).toHaveBeenCalledWith({
      identity: 'pessoa',
      password: 'segredo',
      rememberMe: true,
    })
  })

  it('prevents invalid submission and focuses the first invalid field', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Email ou usuário')).toHaveFocus()
    expect(screen.getByText('Informe seu email ou usuário.')).toBeVisible()
    expect(screen.getByText('Informe sua senha.')).toBeVisible()
  })
})
