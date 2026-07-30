import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { PostCard } from '../molecules/PostCard'
import { FeedTemplate } from '../templates/FeedTemplate'
import { listPosts } from '../../features/feed/feed.service'
import type { PaginatedPosts } from '../../features/feed/feed.types'

const chips = ['Front-end', 'React', 'Acessibilidade']
const pageSize = 12

export function FeedPage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [data, setData] = useState<PaginatedPosts>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [page, setPage] = useState(1)
  const [order, setOrder] = useState<'recent' | 'oldest'>('recent')
  const [retry, setRetry] = useState(0)
  const requestId = useRef(0)
  const search = selected.at(-1) ?? query

  useEffect(() => {
    const currentId = ++requestId.current
    setStatus('loading')
    listPosts({ limit: pageSize, page, query: search }).then((result) => {
      if (currentId !== requestId.current) return
      setData(result)
      setStatus('success')
    }).catch(() => {
      if (currentId !== requestId.current) return
      setStatus('error')
    })
  }, [page, retry, search])

  function updateQuery(value: string) {
    setQuery(value)
    setSelected([])
    setPage(1)
  }
  function toggleChip(chip: string) {
    setSelected((current) => current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip])
    setQuery('')
    setPage(1)
  }
  function clearFilters() { setQuery(''); setSelected([]); setPage(1) }
  const posts = order === 'oldest' ? [...(data?.items ?? [])].reverse() : data?.items ?? []

  return <FeedTemplate>
    <section aria-label="Busca e filtros">
      <label className="relative block"><span className="sr-only">Digite o que você procura</span><span aria-hidden="true" className="absolute left-4 top-3 text-lg text-[#bcbcbc]">⌕</span><input className="h-11 w-full rounded bg-surface pl-12 pr-4 text-base text-copy placeholder:text-[#bcbcbc] focus:outline-3 focus:outline-offset-2 focus:outline-accent" onChange={(event) => updateQuery(event.target.value)} placeholder="Digite o que você procura" type="search" value={query} /></label>
      <div className="mt-3 flex flex-wrap items-center gap-3"><div className="flex flex-wrap gap-3">{chips.map((chip) => <button aria-pressed={selected.includes(chip)} className={`rounded px-3 py-1 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected.includes(chip) ? 'bg-accent text-accent-ink' : 'bg-[#e1e1e1] text-[#132e35]'}`} key={chip} onClick={() => toggleChip(chip)} type="button">{chip}{selected.includes(chip) ? ' ×' : ''}</button>)}</div><button className="ml-auto text-sm text-[#bcbcbc] underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent" onClick={clearFilters} type="button">Limpar tudo</button></div>
    </section>
    <section className="mt-12" aria-labelledby="feed-title"><h1 className="sr-only" id="feed-title">Feed público</h1><div className="mb-7 flex justify-center gap-8"><button aria-pressed={order === 'recent'} className={`font-semibold underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent ${order === 'recent' ? 'text-accent underline' : 'text-[#888888]'}`} onClick={() => setOrder('recent')} type="button">Recentes</button><button aria-pressed={order === 'oldest'} className={`font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent ${order === 'oldest' ? 'text-accent underline' : 'text-[#888888]'}`} onClick={() => setOrder('oldest')} type="button">Mais antigos</button></div>
      <div aria-live="polite">{status === 'loading' ? <p className="py-16 text-center text-[#bcbcbc]" role="status">Carregando posts…</p> : null}{status === 'error' ? <div className="py-16 text-center" role="alert"><p>Não foi possível carregar os posts.</p><button className="mt-4 rounded border border-accent px-4 py-2 text-accent" onClick={() => setRetry((value) => value + 1)} type="button">Tentar novamente</button></div> : null}{status === 'success' && posts.length === 0 ? <p className="py-16 text-center text-[#bcbcbc]">Nenhum post encontrado.</p> : null}{status === 'success' && posts.length > 0 ? <div className="grid gap-5 md:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : null}</div>
      {status === 'success' && data && data.meta.totalPages > 1 ? <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-4"><button className="rounded border border-[#888] px-3 py-2 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)} type="button">Anterior</button><span>Página {page} de {data.meta.totalPages}</span><button className="rounded border border-[#888] px-3 py-2 disabled:opacity-40" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)} type="button">Próxima</button></nav> : null}
    </section>
    <p className="sr-only">Para publicar um post, <Link to="/login">entre na sua conta</Link>.</p>
  </FeedTemplate>
}
