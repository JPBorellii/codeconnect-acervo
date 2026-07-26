import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { TextLink } from './TextLink'

describe('TextLink', () => {
  it('renders a valid internal destination and accessible name', () => {
    render(
      <MemoryRouter>
        <TextLink to="/login">Login</TextLink>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Login' })
    expect(link).toHaveAttribute('href', '/login')
    expect(link).not.toHaveAttribute('href', '#')
  })
})
