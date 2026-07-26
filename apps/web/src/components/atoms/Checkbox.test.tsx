import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('forwards native properties and toggles through its label', async () => {
    render(<Checkbox label="Lembrar-me" name="rememberMe" defaultChecked />)
    const checkbox = screen.getByRole('checkbox', { name: 'Lembrar-me' })

    expect(checkbox).toHaveAttribute('name', 'rememberMe')
    expect(checkbox).toBeChecked()
    await userEvent.click(screen.getByText('Lembrar-me'))
    expect(checkbox).not.toBeChecked()
  })
})
