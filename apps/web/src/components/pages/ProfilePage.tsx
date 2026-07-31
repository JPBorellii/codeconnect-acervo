import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { listProfilePosts } from '../../features/profile/profile.service'
import type { ProfilePosts } from '../../features/profile/profile.types'
import { memberSince, profileInitials } from '../../features/profile/profile.presentation'
import { useAuth } from '../../services/auth/use-auth'
import { PostCard } from '../molecules/PostCard'
import { FeedTemplate } from '../templates/FeedTemplate'

type LoadState = 'loading' | 'success' | 'error'

export function ProfilePage() {
  const { authorizedRequest, status, user } = useAuth()
  const [data, setData] = useState<ProfilePosts>()
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [moreState, setMoreState] = useState<LoadState>('success')
  const [retry, setRetry] = useState(0)
  const [nextPage, setNextPage] = useState<number>()
  const requestId = useRef(0)
  const loadLock = useRef(false)

  useEffect(() => {
    if (status !== 'authenticated' || !user) {
      setData(undefined)
      return
    }
    const controller = new AbortController()
    const currentId = ++requestId.current
    setLoadState('loading')
    setMoreState('success')
    setNextPage(undefined)
    void listProfilePosts(1, authorizedRequest, controller.signal).then((result) => {
      if (controller.signal.aborted || currentId !== requestId.current) return
      setData(result)
      setNextPage(result.meta.page < result.meta.totalPages ? result.meta.page + 1 : undefined)
      setLoadState('success')
    }).catch(() => {
      if (controller.signal.aborted || currentId !== requestId.current) return
      setLoadState('error')
    })
    return () => controller.abort()
  }, [authorizedRequest, retry, status, user])

  async function loadMore() {
    if (!nextPage || loadLock.current) return
    loadLock.current = true
    setMoreState('loading')
    const controller = new AbortController()
    try {
      const result = await listProfilePosts(nextPage, authorizedRequest, controller.signal)
      setData((current) => {
        if (!current) return current
        const known = new Set(current.items.map((post) => post.id))
        return { items: [...current.items, ...result.items.filter((post) => !known.has(post.id))], meta: result.meta }
      })
      setNextPage(result.meta.page < result.meta.totalPages ? result.meta.page + 1 : undefined)
      setMoreState('success')
    } catch {
      setMoreState('error')
    } finally {
      loadLock.current = false
    }
  }

  const total = data?.meta.total
  const isEmpty = loadState === 'success' && total === 0 && data?.items.length === 0

  return <FeedTemplate><section aria-labelledby="profile-name">
    <header className="border-b border-[#294047] pb-8 sm:flex sm:items-center sm:gap-6">
      <div aria-label={user?.name ? `Avatar de ${user.name}` : 'Avatar do usuário'} className="mx-auto grid size-24 shrink-0 place-items-center rounded-full bg-accent text-3xl font-semibold text-accent-ink sm:mx-0 sm:size-28" role="img">{profileInitials(user?.name ?? '')}</div>
      <div className="mt-5 text-center sm:mt-0 sm:text-left"><h1 className="text-2xl font-semibold text-accent" id="profile-name">{user?.name ?? 'Perfil'}</h1><p className="mt-2 text-sm text-muted">{memberSince(user?.createdAt ?? '')}</p><p className="mt-3 text-sm font-semibold text-copy">{loadState === 'success' && total !== undefined ? `${total} ${total === 1 ? 'publicação' : 'publicações'}` : 'Publicações indisponíveis'}</p></div>
    </header>
    <section className="mt-10" aria-labelledby="profile-posts-title"><h2 className="text-lg font-semibold text-accent underline underline-offset-4" id="profile-posts-title">Publicações</h2>
      {loadState === 'loading' ? <p aria-live="polite" className="py-16 text-center text-muted" role="status">Carregando publicações…</p> : null}
      {loadState === 'error' ? <div className="py-16 text-center" role="alert"><p>Não foi possível carregar as publicações.</p><button className="mt-4 rounded border border-accent px-4 py-2 font-semibold text-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" onClick={() => setRetry((value) => value + 1)} type="button">Tentar novamente</button></div> : null}
      {isEmpty ? <div className="py-16 text-center"><p>Você ainda não publicou nenhum projeto.</p><Link className="mt-5 inline-block rounded bg-accent px-4 py-2 font-semibold text-accent-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" to="/publicar">Publicar projeto</Link></div> : null}
      {loadState === 'success' && data && !isEmpty ? <div className="mt-6 grid gap-5 lg:grid-cols-2">{data.items.map((post) => <PostCard key={post.id} post={post} showAuthor={false} />)}</div> : null}
      {nextPage ? <div className="mt-8 text-center"><button className="rounded border border-accent px-4 py-2 font-semibold text-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:opacity-45" disabled={moreState === 'loading'} onClick={() => void loadMore()} type="button">{moreState === 'loading' ? 'Carregando…' : 'Carregar mais'}</button>{moreState === 'error' ? <p className="mt-3 text-sm text-red-300" role="alert">Não foi possível carregar mais publicações. Tente novamente.</p> : null}</div> : null}
    </section>
  </section></FeedTemplate>
}
