import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'

function CurrentState() {
  return <div aria-label="Estado atual">{JSON.stringify(useLocation().state)}</div>
}

describe('LoginPage', () => {
  it('renders the normal login experience without a completion state', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeVisible()
    expect(screen.getByLabelText('Email ou usuário')).toBeRequired()
    expect(screen.getByLabelText('Senha')).toBeRequired()
    expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeDisabled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('announces registration completion, focuses it, and consumes navigation state', async () => {
    render(<MemoryRouter initialEntries={[{ pathname: '/login', state: { registrationComplete: true } }]}><LoginPage /><CurrentState /></MemoryRouter>)
    const status = await screen.findByText('Cadastro concluído. Faça login para continuar.')
    expect(status).toHaveTextContent('Cadastro concluído. Faça login para continuar.')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveFocus()
    expect(screen.getByLabelText('Estado atual')).toHaveTextContent('null')
  })

  it('has no accessibility violations with the completion message', async () => {
    const { container } = render(<MemoryRouter initialEntries={[{ pathname: '/login', state: { registrationComplete: true } }]}><LoginPage /></MemoryRouter>)
    expect(await axe(container)).toHaveNoViolations()
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
  })
})
