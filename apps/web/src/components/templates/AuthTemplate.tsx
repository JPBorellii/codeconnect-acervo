import type { ReactNode } from 'react'

type AuthTemplateProps = {
  bannerAlt: string
  bannerSrc: string
  children: ReactNode
}

export function AuthTemplate({
  bannerAlt,
  bannerSrc,
  children,
}: AuthTemplateProps) {
  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-page px-4 py-8 sm:px-8 lg:px-12">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 -top-24 -z-10 h-[34rem] w-[34rem] text-pattern sm:left-4 sm:h-[40rem] sm:w-[40rem] xl:-top-5 xl:left-[110px] xl:h-[450px] xl:w-[320px]"
        fill="none"
        viewBox="0 0 360 480"
      >
        <rect
          height="260"
          rx="68"
          stroke="currentColor"
          strokeWidth="18"
          width="150"
          x="150"
          y="18"
        />
        <rect
          height="260"
          rx="68"
          stroke="var(--color-page)"
          strokeWidth="34"
          width="150"
          x="60"
          y="202"
        />
        <rect
          height="260"
          rx="68"
          stroke="currentColor"
          strokeWidth="18"
          width="150"
          x="60"
          y="202"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -right-28 -z-10 h-[34rem] w-[34rem] rotate-180 text-pattern sm:h-[44rem] sm:w-[44rem] xl:bottom-auto xl:left-[1370px] xl:right-auto xl:top-[760px] xl:h-[520px] xl:w-[410px]"
        fill="none"
        viewBox="0 0 360 480"
      >
        <rect
          height="260"
          rx="68"
          stroke="currentColor"
          strokeWidth="18"
          width="150"
          x="150"
          y="18"
        />
        <rect
          height="260"
          rx="68"
          stroke="var(--color-page)"
          strokeWidth="34"
          width="150"
          x="60"
          y="202"
        />
        <rect
          height="260"
          rx="68"
          stroke="currentColor"
          strokeWidth="18"
          width="150"
          x="60"
          y="202"
        />
      </svg>

      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-surface shadow-2xl shadow-black/30 lg:grid-cols-[53.6%_46.4%] xl:max-w-[994px] xl:-translate-y-[76px]">
        <div className="h-44 overflow-hidden p-4 sm:h-56 sm:p-6 lg:h-auto lg:min-h-[680px] lg:py-10 lg:pl-12 lg:pr-8 xl:min-h-0 xl:py-[54px] xl:pl-[77px] xl:pr-[49px]">
          <img
            alt={bannerAlt}
            className="h-full w-full rounded-sm object-cover object-[center_42%] sm:object-[center_40%] lg:object-contain lg:object-center"
            src={bannerSrc}
          />
        </div>
        <div className="flex items-start">
          <div className="mx-auto w-full max-w-[380px] px-6 py-8 sm:px-8 sm:py-10 lg:max-w-[348px] lg:px-4 lg:py-14 xl:ml-5 xl:mr-0 xl:w-[316px] xl:px-0 xl:py-[64px]">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
