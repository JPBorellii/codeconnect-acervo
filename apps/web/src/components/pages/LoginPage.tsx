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
      banner={{
        avif: {
          sizes:
            '(max-width: 639px) calc(100vw - 64px), (max-width: 1023px) calc(100vw - 112px), 407px',
          srcSet: `${baseUrl}banner-login-407.avif 407w, ${baseUrl}banner-login-814.avif 814w`,
        },
        fallbackSrc: `${baseUrl}banner-login.png`,
        height: 1272,
        webp: {
          sizes:
            '(max-width: 639px) calc(100vw - 64px), (max-width: 1023px) calc(100vw - 112px), 407px',
          srcSet: `${baseUrl}banner-login-407.webp 407w, ${baseUrl}banner-login-814.webp 814w`,
        },
        width: 814,
      }}
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
