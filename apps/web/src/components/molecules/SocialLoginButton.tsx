import { Button } from '../atoms/Button'

type SocialLoginButtonProps = {
  disabled?: boolean
  iconClassName?: string
  iconSrc: string
  onClick?: () => void
  provider: string
}

export function SocialLoginButton({
  disabled,
  iconClassName = 'size-8',
  iconSrc,
  onClick,
  provider,
}: SocialLoginButtonProps) {
  const label = provider === 'GitHub' ? 'Github' : provider === 'Google' ? 'Gmail' : provider

  return (
    <Button
      aria-label={provider === 'Google' ? undefined : provider}
      disabled={disabled}
      icon={
        <img
          alt=""
          className={`${iconClassName} object-contain opacity-100`}
          src={iconSrc}
        />
      }
      onClick={onClick}
      type="button"
      variant="social"
    >
      {label}
    </Button>
  )
}
