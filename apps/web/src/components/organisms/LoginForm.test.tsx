import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('renders an email field and password field with the correct attributes', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    const email = screen.getByLabelText('Email')
    const password = screen.getByLabelText('Senha')
    expect(email).toBeRequired()
    expect(email).toHaveAttribute('autocomplete', 'email')
    expect(email).toHaveAttribute('type', 'email')
    expect(password).toBeRequired()
    expect(password).toHaveAttribute('autocomplete', 'current-password')
  })

  it('trims email but preserves password and does not submit remember-me', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email'), '  pessoa@example.com  ')
    await user.type(screen.getByLabelText('Senha'), ' segredo1 ')
    await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'pessoa@example.com',
      password: ' segredo1 ',
    })
  })

  it('prevents invalid submission and focuses the first invalid field', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(screen.getByText('Informe seu email.')).toBeVisible()
    expect(screen.getByText('Informe sua senha.')).toBeVisible()
  })

  it('validates email format and password limits', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={vi.fn()} />)
    await user.type(screen.getByLabelText('Email'), 'invalid-email')
    await user.type(screen.getByLabelText('Senha'), 'short')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByText('Informe um email válido.')).toBeVisible()
    expect(screen.getByText('A senha deve ter pelo menos 8 caracteres.')).toBeVisible()

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.clear(screen.getByLabelText('Senha'))
    await user.type(screen.getByLabelText('Senha'), 'á'.repeat(37))
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByText('A senha deve ter no máximo 72 bytes.')).toBeVisible()
  })

  it('disables submission while loading', () => {
    render(<LoginForm isSubmitting onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
  })
})
