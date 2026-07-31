import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../../services/auth/use-auth'
import { CodeConnectLogo } from '../atoms/CodeConnectLogo'

type NavigationIconName = 'feed' | 'profile' | 'about' | 'login'
type NavigationEntry = { icon: NavigationIconName; label: string; to?: string }

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const paths: Record<NavigationIconName, ReactNode> = {
    about: <path d="M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    feed: <path d="M6 3h8l4 4v14H6V3Zm8 0v5h5M9 12h6m-6 4h6" />,
    login: <path d="M14 7h4v12H6v-4m5-8-4 5 4 5m-4-5h10" />,
    profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />,
  }
  return <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">{paths[name]}</svg>
}

function navigationEntries(isAuthenticated: boolean): NavigationEntry[] {
  return [
    { icon: 'feed', label: 'Feed', to: '/feed' },
    { icon: 'profile', label: 'Perfil', to: isAuthenticated ? '/perfil' : '/login' },
    { icon: 'about', label: 'Sobre nós' },
    { icon: 'login', label: isAuthenticated ? 'Sair' : 'Entrar', to: isAuthenticated ? undefined : '/login' },
  ]
}

export function FeedNavigation() {
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()
  const items = navigationEntries(isAuthenticated).map((entry) => {
    if (entry.label === 'Sair') return <button className="feed-nav-item" key={entry.label} onClick={logout} type="button"><NavigationIcon name="login" />Sair</button>
    if (entry.to) return <Link aria-current={location.pathname === entry.to ? 'page' : undefined} className="feed-nav-item" key={entry.label} state={!isAuthenticated && entry.to === '/login' ? { from: `${location.pathname}${location.search}${location.hash}` } : undefined} to={entry.to}><NavigationIcon name={entry.icon} />{entry.label}</Link>
    return <span aria-disabled="true" className="feed-nav-item cursor-default" key={entry.label} tabIndex={0}><NavigationIcon name={entry.icon} />{entry.label}</span>
  })
  const publishPath = isAuthenticated ? '/publicar' : '/login'

  const loginState = !isAuthenticated ? { from: `${location.pathname}${location.search}${location.hash}` } : undefined

  return <>
    <aside className="hidden min-h-screen w-48 shrink-0 flex-col rounded-lg bg-surface px-4 py-10 lg:min-h-[calc(100dvh-6rem)] lg:py-6 lg:flex">
      <CodeConnectLogo />
      <Link className="mt-10 rounded-lg border border-accent px-4 py-3 text-center font-semibold text-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" state={loginState} to={publishPath}>Publicar</Link>
      <nav aria-label="Navegação principal lateral" className="mt-7 flex flex-col gap-5">{items}</nav>
    </aside>
    <header className="flex items-center justify-between px-9 pt-6 lg:hidden"><CodeConnectLogo /><Link className="rounded-md border border-accent px-5 py-2 text-sm font-semibold text-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" state={loginState} to={publishPath}>Publicar</Link></header>
    <nav aria-label="Navegação principal inferior" className="fixed inset-x-0 bottom-0 z-10 flex justify-around rounded-t bg-surface px-2 py-4 shadow-[0_-8px_20px_rgba(0,0,0,.18)] lg:hidden">{items}</nav>
  </>
}
