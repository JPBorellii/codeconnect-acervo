import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CadastroForm } from './CadastroForm'

describe('CadastroForm', () => {
  it('renders required fields with the correct types and autocomplete attributes', () => {
    render(<CadastroForm onSubmit={vi.fn()} />)

    const name = screen.getByLabelText('Nome')
    const email = screen.getByLabelText('Email')
    const password = screen.getByLabelText('Senha')

    expect(name).toBeRequired()
    expect(name).toHaveAttribute('autocomplete', 'name')
    expect(email).toBeRequired()
    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('autocomplete', 'email')
    expect(password).toBeRequired()
    expect(password).toHaveAttribute('type', 'password')
    expect(password).toHaveAttribute('autocomplete', 'new-password')
    expect(password).toHaveAttribute('placeholder', '******')
  })

  it('normalizes name and email and submits local values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CadastroForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nome'), '  Ada Lovelace  ')
    await user.type(screen.getByLabelText('Email'), '  ada@example.com  ')
    await user.type(screen.getByLabelText('Senha'), 'segredo')
    await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      password: 'segredo',
      rememberMe: true,
    })
  })

  it('prevents invalid submission and focuses the first invalid field', async () => {
    const onSubmit = vi.fn()
    render(<CadastroForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Nome')).toHaveFocus()
    expect(screen.getByText('Informe seu nome.')).toBeVisible()
    expect(screen.getByText('Informe seu email.')).toBeVisible()
    expect(screen.getByText('Informe sua senha.')).toBeVisible()
  })

  it('rejects an invalid email without submitting and focuses the email field', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CadastroForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nome'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'email-invalido')
    await user.type(screen.getByLabelText('Senha'), 'segredo')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe um email válido.')).toBeVisible()
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })
})
