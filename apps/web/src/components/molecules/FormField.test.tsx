import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('associates its label and error with the input', () => {
    render(
      <FormField
        error="Informe seu email ou usuário."
        id="identity"
        label="Email ou usuário"
      />,
    )

    const input = screen.getByLabelText('Email ou usuário')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Informe seu email ou usuário.')
  })
})
