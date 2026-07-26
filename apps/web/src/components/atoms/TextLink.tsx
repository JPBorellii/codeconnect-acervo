import type { ComponentProps } from 'react'
import { Link } from 'react-router'

export function TextLink({
  className = '',
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`rounded-sm text-accent underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent ${className}`}
      {...props}
    />
  )
}
