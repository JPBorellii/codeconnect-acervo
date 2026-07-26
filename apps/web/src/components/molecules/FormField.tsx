import type { InputHTMLAttributes } from 'react'
import { TextInput } from '../atoms/TextInput'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  helperText?: string
  id: string
  label: string
}

export function FormField({
  error,
  helperText,
  id,
  label,
  ...inputProps
}: FormFieldProps) {
  const descriptionId = error
    ? `${id}-error`
    : helperText
      ? `${id}-helper`
      : undefined

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-normal text-copy" htmlFor={id}>
        {label}
      </label>
      <TextInput
        id={id}
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        {...inputProps}
      />
      {error ? (
        <p className="text-xs text-red-300" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted" id={`${id}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
