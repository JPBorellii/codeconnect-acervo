type SectionDividerProps = {
  variant?: 'default' | 'figma'
}

export function SectionDivider({ variant = 'default' }: SectionDividerProps) {
  const isFigma = variant === 'figma'

  return (
    <div
      className={`flex items-center text-center font-normal text-copy ${
        isFigma ? 'gap-4 text-[15px] leading-[1.5]' : 'gap-3 text-xs'
      }`}
    >
      <span aria-hidden="true" className="h-px flex-1 bg-copy/70" />
      <span>ou entre com outras contas</span>
      <span aria-hidden="true" className="h-px flex-1 bg-copy/70" />
    </div>
  )
}
