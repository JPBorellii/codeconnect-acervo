import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { FormField } from '../molecules/FormField'

export type LoginValues = {
  email: string
  password: string
}

type LoginFormProps = {
  isSubmitting?: boolean
  onSubmit: (values: LoginValues) => void
  passwordClearSignal?: number
}

type LoginErrors = Partial<Record<'email' | 'password', string>>

export function LoginForm({ isSubmitting = false, onSubmit, passwordClearSignal = 0 }: LoginFormProps) {
  const [errors, setErrors] = useState<LoginErrors>({})
  const [password, setPassword] = useState('')

  useEffect(() => {
    setPassword('')
  }, [passwordClearSignal])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (isSubmitting) return
    const emailInput = form.elements.namedItem('email') as HTMLInputElement
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement
    const nextErrors: LoginErrors = {}

    const email = emailInput.value.trim()
    if (!email) {
      nextErrors.email = 'Informe seu email.'
    } else if (!emailInput.validity.valid) {
      nextErrors.email = 'Informe um email válido.'
    }
    if (!passwordInput.value) {
      nextErrors.password = 'Informe sua senha.'
    } else if (passwordInput.value.length < 8) {
      nextErrors.password = 'A senha deve ter pelo menos 8 caracteres.'
    } else if (new TextEncoder().encode(passwordInput.value).length > 72) {
      nextErrors.password = 'A senha deve ter no máximo 72 bytes.'
    }

    setErrors(nextErrors)
    if (nextErrors.email) {
      emailInput.focus()
      return
    }
    if (nextErrors.password) {
      passwordInput.focus()
      return
    }

    onSubmit({
      email,
      password: passwordInput.value,
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
            autoComplete="email"
            error={errors.email}
            id="email"
            label="Email"
            name="email"
            required
            type="email"
          />
          <FormField
            autoComplete="current-password"
            error={errors.password}
            id="password"
            label="Senha"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
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
