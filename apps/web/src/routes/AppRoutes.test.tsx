import { render, screen } from '@testing-library/react'
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
})
