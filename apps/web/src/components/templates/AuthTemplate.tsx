import type { ReactNode } from 'react'

type BannerSource = {
  sizes?: string
  srcSet: string
}

type AuthBanner = {
  avif: BannerSource
  fallbackSrc: string
  height: number
  webp: BannerSource
  width: number
}

type AuthTemplateProps = {
  bannerAlt: string
  banner: AuthBanner
  bannerLogoSrc?: string
  children: ReactNode
  patternBottomSrc?: string
  patternTopSrc?: string
  variant?: 'default' | 'cadastro'
}

export function AuthTemplate({
  bannerAlt,
  banner,
  bannerLogoSrc,
  children,
  patternBottomSrc,
  patternTopSrc,
  variant = 'default',
}: AuthTemplateProps) {
  const isCadastro = variant === 'cadastro'

  return (
    <main
      className={`relative isolate flex min-h-dvh justify-center bg-page px-4 py-8 sm:px-8 lg:px-12 ${
        isCadastro
          ? 'items-start overflow-x-hidden overflow-y-auto'
          : 'items-center overflow-hidden'
      }`}
    >
      {patternTopSrc ? (
        <img
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-28 -top-24 -z-10 h-[34rem] w-[34rem] object-contain sm:left-4 sm:h-[40rem] sm:w-[40rem] xl:left-[142px] xl:top-0 xl:h-[480px] xl:w-[407px]"
          src={patternTopSrc}
        />
      ) : (
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
      )}
      {patternBottomSrc ? (
        <img
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 -right-28 -z-10 h-[34rem] w-[34rem] object-contain sm:h-[44rem] sm:w-[44rem] xl:bottom-0 xl:right-[142px] xl:h-[486px] xl:w-[407px]"
          src={patternBottomSrc}
        />
      ) : (
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
      )}

      <div
        className={`grid w-full max-w-5xl overflow-hidden bg-surface ${
          isCadastro
            ? 'rounded-[32px] border border-black xl:max-w-[996px] xl:grid-cols-[508px_410px]'
            : 'rounded-3xl shadow-2xl shadow-black/30 lg:grid-cols-[53.6%_46.4%] xl:max-w-[994px] xl:-translate-y-[76px]'
        }`}
      >
        <div
          className={`h-44 overflow-hidden p-4 sm:h-56 sm:p-6 lg:h-auto lg:min-h-[680px] lg:py-10 lg:pl-12 lg:pr-8 ${
            isCadastro
              ? 'xl:min-h-0 xl:py-[56px] xl:pl-[78px] xl:pr-[23px]'
              : 'xl:min-h-0 xl:py-[54px] xl:pl-[77px] xl:pr-[49px]'
          }`}
        >
          <div className="relative h-full w-full">
            <picture className="contents">
              <source
                sizes={banner.avif.sizes}
                srcSet={banner.avif.srcSet}
                type="image/avif"
              />
              <source
                sizes={banner.webp.sizes}
                srcSet={banner.webp.srcSet}
                type="image/webp"
              />
              <img
                alt={bannerAlt}
                className={`h-full w-full rounded-sm object-cover object-[center_42%] sm:object-[center_40%] ${
                  isCadastro
                    ? 'lg:object-cover lg:object-center xl:mt-1 xl:h-[675px]'
                    : 'lg:object-contain lg:object-center'
                }`}
                height={banner.height}
                src={banner.fallbackSrc}
                width={banner.width}
              />
            </picture>
            {bannerLogoSrc ? (
              <img
                alt="CodeConnect"
                className="absolute bottom-[39px] left-1/2 h-10 w-[127px] -translate-x-1/2 object-contain"
                src={bannerLogoSrc}
              />
            ) : null}
          </div>
        </div>
        <div className="flex items-start">
          <div
            className={`mx-auto w-full max-w-[380px] px-6 py-8 sm:px-8 sm:py-10 lg:max-w-[348px] lg:px-4 lg:py-14 ${
              isCadastro
                ? 'xl:mx-0 xl:w-[410px] xl:max-w-none xl:px-8 xl:py-[56px]'
                : 'xl:ml-5 xl:mr-0 xl:w-[316px] xl:px-0 xl:py-[64px]'
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
