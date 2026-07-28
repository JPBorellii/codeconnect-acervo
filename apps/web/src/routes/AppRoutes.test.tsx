import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes'

function CurrentPath() {
  return <output aria-label="Rota atual">{useLocation().pathname}</output>
}

function renderRoutes(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <CurrentPath />
    </MemoryRouter>,
  )
}

describe('AppRoutes', () => {
  it('renders LoginPage at /login', () => {
    renderRoutes('/login')
    expect(screen.getByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/login')
  })

  it('redirects / to /login', () => {
    renderRoutes('/')
    expect(screen.getByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/login')
  })

  it('renders CadastroPage at /cadastro', () => {
    renderRoutes('/cadastro')
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/cadastro')
  })

  it('navigates from login to cadastro and back to login', async () => {
    const user = userEvent.setup()
    renderRoutes('/login')

    await user.click(screen.getByRole('link', { name: 'Crie seu cadastro!' }))
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/cadastro')

    await user.click(screen.getByRole('link', { name: 'Faça seu login!' }))
    expect(screen.getByRole('heading', { name: 'Login' })).toBeVisible()
    expect(screen.getByLabelText('Rota atual')).toHaveTextContent('/login')
  })
})
