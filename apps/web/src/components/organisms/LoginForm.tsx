import { useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { FormField } from '../molecules/FormField'

export type LoginValues = {
  identity: string
  password: string
  rememberMe: boolean
}

type LoginFormProps = {
  isSubmitting?: boolean
  onSubmit: (values: LoginValues) => void
}

type LoginErrors = Partial<Record<'identity' | 'password', string>>

export function LoginForm({ isSubmitting = false, onSubmit }: LoginFormProps) {
  const [errors, setErrors] = useState<LoginErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const identityInput = form.elements.namedItem('identity') as HTMLInputElement
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement
    const rememberInput = form.elements.namedItem(
      'rememberMe',
    ) as HTMLInputElement
    const nextErrors: LoginErrors = {}

    if (!identityInput.value.trim()) {
      nextErrors.identity = 'Informe seu email ou usuário.'
    }
    if (!passwordInput.value) {
      nextErrors.password = 'Informe sua senha.'
    }

    setErrors(nextErrors)
    if (nextErrors.identity) {
      identityInput.focus()
      return
    }
    if (nextErrors.password) {
      passwordInput.focus()
      return
    }

    onSubmit({
      identity: identityInput.value.trim(),
      password: passwordInput.value,
      rememberMe: rememberInput.checked,
    })
  }

  return (
    <section aria-labelledby="login-title">
      <h1 className="text-[28px] font-semibold leading-tight text-copy" id="login-title">
        Login
      </h1>
      <p className="mt-6 text-base font-normal text-copy">
        Boas-vindas! Faça seu login.
      </p>

      <form className="mt-[52px]" noValidate onSubmit={handleSubmit}>
        <div className="space-y-[27px]">
          <FormField
            autoComplete="username"
            error={errors.identity}
            id="identity"
            label="Email ou usuário"
            name="identity"
            required
            type="text"
          />
          <FormField
            autoComplete="current-password"
            error={errors.password}
            id="password"
            label="Senha"
            name="password"
            required
            type="password"
          />
        </div>

        <div className="mt-[21px] flex flex-wrap items-center justify-between gap-2">
          <Checkbox id="rememberMe" label="Lembrar-me" name="rememberMe" />
          <span className="text-xs text-copy underline underline-offset-4">
            Esqueci a senha
          </span>
        </div>

        <div className="mt-6">
          <Button disabled={isSubmitting} type="submit">
            <span>{isSubmitting ? 'Entrando...' : 'Login'}</span>
            <span aria-hidden="true" className="ml-3 text-xl leading-none">
              →
            </span>
          </Button>
        </div>
      </form>
    </section>
  )
}
