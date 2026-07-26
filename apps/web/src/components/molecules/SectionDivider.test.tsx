import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SectionDivider } from './SectionDivider'

describe('SectionDivider', () => {
  it('keeps its text accessible and decorative lines hidden', () => {
    const { container } = render(<SectionDivider />)
    expect(screen.getByText('ou entre com outras contas')).toBeVisible()
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
  })
})
