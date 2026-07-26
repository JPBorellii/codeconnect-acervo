import { SectionDivider } from '../molecules/SectionDivider'
import { SocialLoginButton } from '../molecules/SocialLoginButton'

type SocialLoginOptionsProps = {
  onGitHubClick?: () => void
  onGoogleClick?: () => void
}

export function SocialLoginOptions({
  onGitHubClick,
  onGoogleClick,
}: SocialLoginOptionsProps) {
  const baseUrl = import.meta.env.BASE_URL

  return (
    <section aria-label="Outras opções de login" className="space-y-4">
      <SectionDivider />
      <div className="flex flex-wrap justify-center gap-3">
        <SocialLoginButton
          disabled={!onGitHubClick}
          iconSrc={`${baseUrl}github.png`}
          onClick={onGitHubClick}
          provider="GitHub"
        />
        <SocialLoginButton
          disabled={!onGoogleClick}
          iconSrc={`${baseUrl}gmail.png`}
          onClick={onGoogleClick}
          provider="Google"
        />
      </div>
    </section>
  )
}
