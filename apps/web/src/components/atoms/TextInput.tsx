import type { InputHTMLAttributes } from 'react'

export function TextInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-[38px] w-full rounded-md border-2 border-transparent bg-field px-3 py-1 text-sm text-[#172126] placeholder:text-[#3c4548] focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-400 ${className}`}
      {...props}
    />
  )
}
