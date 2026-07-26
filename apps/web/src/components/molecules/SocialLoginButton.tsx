import { Button } from '../atoms/Button'

type SocialLoginButtonProps = {
  disabled?: boolean
  iconSrc: string
  onClick?: () => void
  provider: string
}

export function SocialLoginButton({
  disabled,
  iconSrc,
  onClick,
  provider,
}: SocialLoginButtonProps) {
  return (
    <Button
      aria-label={provider}
      disabled={disabled}
      icon={<img alt="" className="size-8 object-contain opacity-100" src={iconSrc} />}
      onClick={onClick}
      type="button"
      variant="social"
    >
      {provider === 'GitHub' ? 'Github' : provider === 'Google' ? 'Gmail' : provider}
    </Button>
  )
}
