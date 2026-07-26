import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TextInput } from './TextInput'

describe('TextInput', () => {
  it('forwards validation, autocomplete and ARIA properties', () => {
    render(
      <TextInput
        aria-describedby="email-error"
        aria-invalid
        aria-label="Email"
        autoComplete="username"
        required
      />,
    )

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('autocomplete', 'username')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
  })
})
