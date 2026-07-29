import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { authService } from '../../services/auth/auth.service'
import { ApiError } from '../../services/http/ApiError'
import { AuthPrompt } from '../molecules/AuthPrompt'
import { CadastroForm, type CadastroValues } from '../organisms/CadastroForm'
import { SocialLoginOptions } from '../organisms/SocialLoginOptions'
import { AuthTemplate } from '../templates/AuthTemplate'

export function CadastroPage() {
  const baseUrl = import.meta.env.BASE_URL
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string>()
  const errorRef = useRef<HTMLParagraphElement>(null)

  async function handleCadastro(values: CadastroValues) {
    if (isSubmitting) return
    setSubmissionError(undefined)
    setIsSubmitting(true)

    try {
      await authService.register({
        email: values.email,
        name: values.name,
        password: values.password,
      })
      navigate('/login', { state: { registrationComplete: true } })
    } catch (error) {
      setSubmissionError(getSubmissionError(error))
      requestAnimationFrame(() => errorRef.current?.focus())
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthTemplate
      bannerAlt="Profissional trabalhando diante de telas de monitoramento"
      banner={{
        avif: { srcSet: `${baseUrl}banner-cadastro.avif` },
        fallbackSrc: `${baseUrl}banner-cadastro.png`,
        height: 675,
        webp: { srcSet: `${baseUrl}banner-cadastro.webp` },
        width: 407,
      }}
      bannerLogoSrc={`${baseUrl}logo-codeconnect-cadastro.png`}
      patternBottomSrc={`${baseUrl}grafismo-cadastro-inferior.png`}
      patternTopSrc={`${baseUrl}grafismo-cadastro-superior.png`}
      variant="cadastro"
    >
      {submissionError ? (
        <p
          aria-live="assertive"
          className="mb-6 text-auth-body text-red-300"
          ref={errorRef}
          role="alert"
          tabIndex={-1}
        >
          {submissionError}
        </p>
      ) : null}
      <CadastroForm isSubmitting={isSubmitting} onSubmit={handleCadastro} />
      <div className="mt-8">
        <SocialLoginOptions variant="figma" />
      </div>
      <div className="mt-6">
        <AuthPrompt
          action="Faça seu login!"
          destination="/login"
          icon="login"
          layout="inline"
          message="Já tem conta?"
        />
      </div>
    </AuthTemplate>
  )
}

function getSubmissionError(error: unknown) {
  if (!(error instanceof ApiError)) return 'Não foi possível concluir o cadastro. Tente novamente.'
  if (error.status === 400) return 'Revise os dados informados.'
  if (error.status === 409) return 'Este email já está cadastrado.'
  if (error.category === 'timeout') return 'A solicitação demorou demais. Tente novamente.'
  if (error.category === 'network') return 'Não foi possível conectar ao servidor. Tente novamente.'
  return 'Não foi possível concluir o cadastro. Tente novamente.'
}
