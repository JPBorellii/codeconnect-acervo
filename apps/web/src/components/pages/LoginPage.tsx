import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { authService } from '../../services/auth/auth.service'
import type { PublicUser } from '../../services/auth/auth.types'
import { ApiError } from '../../services/http/ApiError'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string>()
  const [authenticatedUser, setAuthenticatedUser] = useState<PublicUser>()
  const [passwordClearSignal, setPasswordClearSignal] = useState(0)
  const errorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!registrationComplete) return
    setShowCompletion(true)
    successRef.current?.focus()
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, navigate, registrationComplete])

  async function handleLogin(values: LoginValues) {
    if (isSubmitting) return
    setSubmissionError(undefined)
    setAuthenticatedUser(undefined)
    setShowCompletion(false)
    setIsSubmitting(true)

    let isValidatingSession = false
    try {
      const { accessToken } = await authService.login({
        email: values.email,
        password: values.password,
      })
      isValidatingSession = true
      const user = await authService.getMe(accessToken)
      setAuthenticatedUser(user)
      setPasswordClearSignal((signal) => signal + 1)
      requestAnimationFrame(() => successRef.current?.focus())
    } catch (error) {
      setSubmissionError(getLoginError(error, isValidatingSession))
      requestAnimationFrame(() => errorRef.current?.focus())
    } finally {
      setIsSubmitting(false)
    }
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
        {authenticatedUser ? (
          <p
            aria-live="polite"
            className="text-auth-body text-copy"
            ref={successRef}
            role="status"
            tabIndex={-1}
          >
            Login realizado com sucesso. Olá, {authenticatedUser.name}.
          </p>
        ) : null}
        {submissionError ? (
          <p
            aria-live="assertive"
            className="text-auth-body text-red-300"
            ref={errorRef}
            role="alert"
            tabIndex={-1}
          >
            {submissionError}
          </p>
        ) : null}
        <LoginForm
          isSubmitting={isSubmitting}
          onSubmit={handleLogin}
          passwordClearSignal={passwordClearSignal}
        />
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

function getLoginError(error: unknown, isValidatingSession: boolean) {
  if (!(error instanceof ApiError)) return 'Não foi possível realizar o login. Tente novamente.'
  if (isValidatingSession && error.status === 401) {
    return 'Não foi possível validar sua sessão. Faça login novamente.'
  }
  if (error.status === 401) return 'Email ou senha inválidos.'
  if (error.category === 'timeout') return 'A solicitação demorou demais. Tente novamente.'
  if (error.category === 'network') return 'Não foi possível conectar ao servidor. Tente novamente.'
  return 'Não foi possível realizar o login. Tente novamente.'
}
