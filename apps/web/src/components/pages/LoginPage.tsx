import { AuthPrompt } from '../molecules/AuthPrompt'
import { LoginForm, type LoginValues } from '../organisms/LoginForm'
import { SocialLoginOptions } from '../organisms/SocialLoginOptions'
import { AuthTemplate } from '../templates/AuthTemplate'

export function LoginPage() {
  const baseUrl = import.meta.env.BASE_URL

  function handleLogin(_values: LoginValues) {
    // A autenticação será conectada quando houver um contrato de API aprovado.
  }

  return (
    <AuthTemplate
      bannerAlt="Pessoa em um ambiente tecnológico da CodeConnect"
      bannerSrc={`${baseUrl}banner-login.png`}
    >
      <div className="space-y-8">
        <LoginForm onSubmit={handleLogin} />
        <SocialLoginOptions />
        <AuthPrompt
          action="Crie seu cadastro!"
          destination="/cadastro"
          message="Ainda não tem conta?"
        />
      </div>
    </AuthTemplate>
  )
}
