import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AuthPrompt } from '../molecules/AuthPrompt'
import { LoginForm, type LoginValues } from '../organisms/LoginForm'
import { SocialLoginOptions } from '../organisms/SocialLoginOptions'
import { AuthTemplate } from '../templates/AuthTemplate'

export function LoginPage() {
  const baseUrl = import.meta.env.BASE_URL
  const location = useLocation()
  const navigate = useNavigate()
  const successRef = useRef<HTMLParagraphElement>(null)
  const registrationComplete = Boolean(
    (location.state as { registrationComplete?: boolean } | null)?.registrationComplete,
  )
  const [showCompletion, setShowCompletion] = useState(registrationComplete)

  useEffect(() => {
    if (!registrationComplete) return
    setShowCompletion(true)
    successRef.current?.focus()
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, navigate, registrationComplete])

  function handleLogin(_values: LoginValues) {
    // Login will be connected in a later phase.
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
        {showCompletion ? (
          <p
            aria-live="polite"
            className="text-auth-body text-copy"
            ref={successRef}
            role="status"
            tabIndex={-1}
          >
            Cadastro concluído. Faça login para continuar.
          </p>
        ) : null}
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
