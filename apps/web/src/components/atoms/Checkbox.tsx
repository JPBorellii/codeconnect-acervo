import type { InputHTMLAttributes } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  boxClassName?: string
  containerClassName?: string
  label: string
  labelClassName?: string
}

export function Checkbox({
  boxClassName = '',
  className = '',
  containerClassName = '',
  label,
  labelClassName = '',
  ...props
}: CheckboxProps) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 text-xs font-normal text-copy ${containerClassName}`}
    >
      <span
        className={`relative inline-grid size-5 shrink-0 place-items-center ${boxClassName}`}
      >
        <input
          type="checkbox"
          className={`peer absolute inset-0 size-5 appearance-none rounded border-2 border-muted bg-transparent checked:border-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
          {...props}
        />
        <svg
          aria-hidden="true"
          className="pointer-events-none relative size-4 text-accent opacity-0 peer-checked:opacity-100"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            d="m3 8 3 3 7-8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </span>
      <span className={labelClassName}>{label}</span>
    </label>
  )
}
