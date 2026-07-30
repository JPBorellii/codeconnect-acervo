import type { ReactNode } from 'react'
import { FeedNavigation } from '../organisms/FeedNavigation'

export function FeedTemplate({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-page lg:flex lg:gap-7 lg:px-[max(2rem,calc((100vw-1308px)/2))] lg:py-12"><FeedNavigation /><main className="mx-auto w-full max-w-[848px] scroll-pb-[calc(9rem+env(safe-area-inset-bottom))] px-9 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-9 sm:px-9 lg:mx-0 lg:px-0 lg:pb-0 lg:pt-0">{children}</main></div>
}
