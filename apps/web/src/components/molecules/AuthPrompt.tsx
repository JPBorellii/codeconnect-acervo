import { TextLink } from '../atoms/TextLink'

type AuthPromptProps = {
  action: string
  destination?: string
  icon?: 'assignment' | 'login'
  layout?: 'stacked' | 'inline'
  message: string
}

export function AuthPrompt({
  action,
  destination,
  icon = 'assignment',
  layout = 'stacked',
  message,
}: AuthPromptProps) {
  const isInline = layout === 'inline'
  const actionContent = (
    <>
      <span>{action}</span>
      {icon === 'login' ? (
        <svg
          aria-hidden="true"
          className={isInline ? 'size-6 shrink-0' : 'size-5 shrink-0'}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5Zm4-5H5a2 2 0 0 0-2 2v4h2V4h10v16H5v-4H3v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="size-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M8 5.5h8M9 3h6v4H9V3Zm-2 4h10a2 2 0 0 1 2 2v11H5V9a2 2 0 0 1 2-2Zm2 5h6m-6 4h6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </>
  )

  return (
    <div
      className={
        isInline
          ? 'flex flex-wrap items-center gap-2 text-left'
          : 'space-y-1.5 text-center'
      }
    >
      <p
        className={
          isInline
            ? 'text-[18px] font-normal leading-[1.5] text-copy'
            : 'text-sm font-normal text-copy'
        }
      >
        {message}
      </p>
      {destination ? (
        <TextLink
          className={`items-center text-accent ${
            isInline
              ? 'inline-flex gap-3 text-[18px] leading-[1.5]'
              : 'inline-flex justify-center gap-2 text-base'
          }`}
          to={destination}
        >
          {actionContent}
        </TextLink>
      ) : (
        <div className="flex items-center justify-center gap-2 text-accent">
          {actionContent}
        </div>
      )}
    </div>
  )
}
