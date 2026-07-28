import { AuthPrompt } from '../molecules/AuthPrompt'
import {
  CadastroForm,
  type CadastroValues,
} from '../organisms/CadastroForm'
import { SocialLoginOptions } from '../organisms/SocialLoginOptions'
import { AuthTemplate } from '../templates/AuthTemplate'

export function CadastroPage() {
  const baseUrl = import.meta.env.BASE_URL

  function handleCadastro(_values: CadastroValues) {
    // O cadastro será conectado quando houver um contrato de API aprovado.
  }

  return (
    <AuthTemplate
      bannerAlt="Profissional trabalhando diante de telas de monitoramento"
      bannerLogoSrc={`${baseUrl}logo-codeconnect-cadastro.png`}
      bannerSrc={`${baseUrl}banner-cadastro.png`}
      patternBottomSrc={`${baseUrl}grafismo-cadastro-inferior.png`}
      patternTopSrc={`${baseUrl}grafismo-cadastro-superior.png`}
      variant="cadastro"
    >
      <CadastroForm onSubmit={handleCadastro} />
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
