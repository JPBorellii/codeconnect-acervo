import { TextLink } from '../atoms/TextLink'

type AuthPromptProps = {
  action: string
  destination?: string
  message: string
}

export function AuthPrompt({
  action,
  destination,
  message,
}: AuthPromptProps) {
  return (
    <div className="space-y-1.5 text-center">
      <p className="text-sm font-normal text-copy">{message}</p>
      {destination ? (
        <TextLink className="inline-block text-base" to={destination}>
          {action}
        </TextLink>
      ) : (
        <div className="flex items-center justify-center gap-2 text-accent">
          <p className="text-base font-normal">{action}</p>
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
        </div>
      )}
    </div>
  )
}
