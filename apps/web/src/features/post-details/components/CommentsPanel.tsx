import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { PaginatedComments, PublicComment } from '../types/post-details.types'
import { formatDate } from '../utils/post-content'

type CommentsPanelProps = {
  comments?: PaginatedComments
  isAuthenticated: boolean
  isSubmitting: boolean
  onPageChange: (page: number) => void
  onSubmit: (content: string) => Promise<void>
  returnPath: string
  state: 'idle' | 'loading' | 'success' | 'error'
}

function CommentItem({ comment }: { comment: PublicComment }) {
  const date = formatDate(comment.createdAt)
  return <li className="border-t border-[#bcbcbc] py-4 first:border-t-0 sm:py-5"><p className="break-words text-[13px] leading-5 text-[#132e35] sm:text-sm sm:leading-6"><strong>@{comment.author.name}</strong> {comment.content}</p>{date ? <time className="mt-2 block text-xs text-[#3e3e3f]" dateTime={comment.createdAt}>{date}</time> : null}</li>
}

export function CommentsPanel({ comments, isAuthenticated, isSubmitting, onPageChange, onSubmit, returnPath, state }: CommentsPanelProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string>()
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = content.trim()
    if (!normalized) { setError('Escreva um comentário antes de enviar.'); return }
    if (normalized.length > 2000) { setError('O comentário deve ter no máximo 2000 caracteres.'); return }
    setError(undefined)
    try {
      await onSubmit(normalized)
      setContent('')
    } catch {
      setError('Não foi possível enviar seu comentário. Tente novamente.')
    }
  }
  return <section className="mt-8 rounded-lg bg-[#e1e1e1] p-4 text-[#132e35] sm:p-5 lg:p-6" aria-labelledby="comments-title">
    <h2 className="text-lg font-semibold sm:text-xl" id="comments-title">Comentários</h2>
    {isAuthenticated ? <form className="mt-4" noValidate onSubmit={(event) => void handleSubmit(event)}><label className="sr-only" htmlFor="comment-content">Escreva um comentário</label><textarea aria-describedby={error ? 'comment-error' : undefined} aria-invalid={Boolean(error)} className="min-h-28 w-full resize-y rounded border border-[#888] bg-white p-3 text-sm text-[#132e35] placeholder:text-[#3e3e3f] focus:border-accent focus:outline-none" id="comment-content" maxLength={2000} onChange={(event) => setContent(event.target.value)} placeholder="Escreva um comentário" value={content} />{error ? <p className="mt-2 text-sm text-red-700" id="comment-error" role="alert">{error}</p> : null}<button className="mt-3 rounded bg-accent px-5 py-2 font-semibold text-accent-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:opacity-50" disabled={isSubmitting} type="submit">{isSubmitting ? 'Enviando...' : 'Comentar'}</button></form> : <p className="mt-4 text-sm text-[#3e3e3f]"><Link className="font-semibold text-[#132e35] underline decoration-accent decoration-2 underline-offset-4 hover:text-[#3e3e3f] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" state={{ from: returnPath }} to="/login">Entre</Link> para comentar.</p>}
    <div aria-live="polite" className="mt-5 sm:mt-6">{state === 'loading' ? <p role="status">Carregando comentários…</p> : null}{state === 'error' ? <p role="alert">Não foi possível carregar os comentários.</p> : null}{state === 'success' && comments?.items.length === 0 ? <p className="text-[#3e3e3f]">Ainda não há comentários.</p> : null}{comments?.items.length ? <ul><>{comments.items.map((comment) => <CommentItem comment={comment} key={comment.id} />)}</></ul> : null}</div>
    {comments && comments.meta.totalPages > 1 ? <nav aria-label="Paginação de comentários" className="mt-4 flex items-center justify-between gap-3"><button className="rounded border border-[#3e3e3f] px-3 py-2 disabled:opacity-40" disabled={comments.meta.page <= 1} onClick={() => onPageChange(comments.meta.page - 1)} type="button">Anterior</button><span className="text-sm">Página {comments.meta.page} de {comments.meta.totalPages}</span><button className="rounded border border-[#3e3e3f] px-3 py-2 disabled:opacity-40" disabled={comments.meta.page >= comments.meta.totalPages} onClick={() => onPageChange(comments.meta.page + 1)} type="button">Próxima</button></nav> : null}
  </section>
}
