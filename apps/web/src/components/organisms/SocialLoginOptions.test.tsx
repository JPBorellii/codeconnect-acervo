import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialLoginOptions } from './SocialLoginOptions'

describe('SocialLoginOptions', () => {
  it('calls each enabled provider independently without submitting a form', async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn((event: React.FormEvent) =>
      event.preventDefault(),
    )
    const onGitHubClick = vi.fn()
    const onGoogleClick = vi.fn()
    render(
      <form onSubmit={onFormSubmit}>
        <SocialLoginOptions
          onGitHubClick={onGitHubClick}
          onGoogleClick={onGoogleClick}
        />
      </form>,
    )

    await user.click(screen.getByRole('button', { name: 'GitHub' }))
    await user.click(screen.getByRole('button', { name: 'Google' }))
    expect(onGitHubClick).toHaveBeenCalledOnce()
    expect(onGoogleClick).toHaveBeenCalledOnce()
    expect(onFormSubmit).not.toHaveBeenCalled()
  })

  it('marks providers unavailable when integrations are absent', () => {
    render(<SocialLoginOptions />)
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Google' })).toBeDisabled()
  })
})
