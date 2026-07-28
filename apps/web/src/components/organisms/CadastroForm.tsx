import { useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { FormField } from '../molecules/FormField'

export type CadastroValues = {
  email: string
  name: string
  password: string
  rememberMe: boolean
}

type CadastroFormProps = {
  isSubmitting?: boolean
  onSubmit: (values: CadastroValues) => void
}

type CadastroErrors = Partial<Record<'name' | 'email' | 'password', string>>

export function CadastroForm({
  isSubmitting = false,
  onSubmit,
}: CadastroFormProps) {
  const [errors, setErrors] = useState<CadastroErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const nameInput = form.elements.namedItem('name') as HTMLInputElement
    const emailInput = form.elements.namedItem('email') as HTMLInputElement
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement
    const rememberInput = form.elements.namedItem(
      'rememberMe',
    ) as HTMLInputElement
    const nextErrors: CadastroErrors = {}

    if (!nameInput.value.trim()) {
      nextErrors.name = 'Informe seu nome.'
    }
    if (!emailInput.value.trim()) {
      nextErrors.email = 'Informe seu email.'
    } else if (!emailInput.validity.valid) {
      nextErrors.email = 'Informe um email válido.'
    }
    if (!passwordInput.value) {
      nextErrors.password = 'Informe sua senha.'
    }

    setErrors(nextErrors)
    if (nextErrors.name) {
      nameInput.focus()
      return
    }
    if (nextErrors.email) {
      emailInput.focus()
      return
    }
    if (nextErrors.password) {
      passwordInput.focus()
      return
    }

    onSubmit({
      email: emailInput.value.trim(),
      name: nameInput.value.trim(),
      password: passwordInput.value,
      rememberMe: rememberInput.checked,
    })
  }

  const fieldClassName =
    'h-[39px] rounded-[4px] px-4 py-2 text-auth-body'
  const labelClassName = 'text-auth-control'

  return (
    <section aria-labelledby="cadastro-title">
      <h1
        className="text-auth-title font-semibold text-copy"
        id="cadastro-title"
      >
        Cadastro
      </h1>
      <p className="mt-6 text-auth-subtitle font-normal text-copy">
        Olá! Preencha seus dados.
      </p>

      <form className="mt-8" noValidate onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormField
            autoComplete="name"
            className={fieldClassName}
            error={errors.name}
            id="cadastro-name"
            label="Nome"
            labelClassName={labelClassName}
            name="name"
            placeholder="Nome completo"
            required
            type="text"
          />
          <FormField
            autoComplete="email"
            className={fieldClassName}
            error={errors.email}
            id="cadastro-email"
            label="Email"
            labelClassName={labelClassName}
            name="email"
            placeholder="Digite seu email"
            required
            type="email"
          />
          <div>
            <FormField
              autoComplete="new-password"
              className={fieldClassName}
              error={errors.password}
              id="cadastro-password"
              label="Senha"
              labelClassName={labelClassName}
              name="password"
              placeholder="******"
              required
              type="password"
            />
            <div className="mt-2">
              <Checkbox
                boxClassName="size-6"
                className="size-6"
                containerClassName="text-auth-body text-field"
                id="cadastro-rememberMe"
                label="Lembrar-me"
                name="rememberMe"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button
            className="h-[51px] text-auth-control"
            disabled={isSubmitting}
            type="submit"
          >
            <span>{isSubmitting ? 'Cadastrando...' : 'Cadastrar'}</span>
            <span aria-hidden="true" className="ml-2 text-2xl leading-none">
              →
            </span>
          </Button>
        </div>
      </form>
    </section>
  )
}
