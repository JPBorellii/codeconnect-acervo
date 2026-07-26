import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  variant?: 'primary' | 'social'
}

export function Button({
  children,
  className = '',
  icon,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'h-[50px] w-full bg-accent px-6 text-base font-semibold text-accent-ink hover:bg-[#a4ffaa]',
    social:
      'min-w-20 flex-col gap-1.5 bg-transparent px-2 py-1 text-xs font-normal text-copy hover:bg-white/5 disabled:cursor-default disabled:opacity-100',
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
