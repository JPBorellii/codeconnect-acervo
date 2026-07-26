import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialLoginButton } from './SocialLoginButton'

describe('SocialLoginButton', () => {
  it('uses a non-submit button and handles clicks', async () => {
    const onClick = vi.fn()
    render(
      <SocialLoginButton
        iconSrc="/github.png"
        onClick={onClick}
        provider="GitHub"
      />,
    )
    const button = screen.getByRole('button', { name: 'GitHub' })
    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('supports an unavailable state', () => {
    render(
      <SocialLoginButton disabled iconSrc="/github.png" provider="GitHub" />,
    )
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled()
  })
})
