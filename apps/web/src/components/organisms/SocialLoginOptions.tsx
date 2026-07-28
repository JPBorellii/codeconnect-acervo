import { SectionDivider } from '../molecules/SectionDivider'
import { SocialLoginButton } from '../molecules/SocialLoginButton'

type SocialLoginOptionsProps = {
  onGitHubClick?: () => void
  onGoogleClick?: () => void
  variant?: 'default' | 'figma'
}

export function SocialLoginOptions({
  onGitHubClick,
  onGoogleClick,
  variant = 'default',
}: SocialLoginOptionsProps) {
  const baseUrl = import.meta.env.BASE_URL
  const isFigma = variant === 'figma'

  return (
    <section
      aria-label="Outras opções de login"
      className={isFigma ? 'space-y-2' : 'space-y-4'}
    >
      <SectionDivider variant={variant} />
      <div className={`flex flex-wrap justify-center ${isFigma ? 'gap-6' : 'gap-3'}`}>
        <SocialLoginButton
          disabled={!onGitHubClick}
          iconSrc={`${baseUrl}github.png`}
          onClick={onGitHubClick}
          provider="GitHub"
        />
        <SocialLoginButton
          disabled={!onGoogleClick}
          iconClassName={isFigma ? 'size-7' : undefined}
          iconSrc={`${baseUrl}gmail.png`}
          onClick={onGoogleClick}
          provider="Google"
        />
      </div>
    </section>
  )
}
