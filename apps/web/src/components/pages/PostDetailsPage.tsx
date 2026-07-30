import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { CommentsPanel } from '../../features/post-details/components/CommentsPanel'
import { PostDetailCard } from '../../features/post-details/components/PostDetailCard'
import { createComment, getLikeState, updateLike } from '../../features/post-details/api/post-details.service'
import { useComments } from '../../features/post-details/hooks/use-comments'
import { usePost } from '../../features/post-details/hooks/use-post'
import { useSharePost } from '../../features/post-details/hooks/use-share-post'
import type { LikeState } from '../../features/post-details/types/post-details.types'
import { isValidUuid } from '../../features/post-details/utils/is-valid-uuid'
import { useAuth } from '../../services/auth/use-auth'
import { FeedTemplate } from '../templates/FeedTemplate'

export function PostDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { authorizedRequest, isAuthenticated, status } = useAuth()
  const [retry, setRetry] = useState(0)
  const [commentsRetry] = useState(0)
  const [like, setLike] = useState<LikeState>()
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isLikeUpdating, setIsLikeUpdating] = useState(false)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const [commentCount, setCommentCount] = useState<number>()
  const [actionError, setActionError] = useState<string>()
  const likeRequestRef = useRef(false)
  const commentRequestRef = useRef(false)
  const { message: shareMessage, share } = useSharePost()
  const validId = isValidUuid(id)
  const { post, state } = usePost(id, validId, retry)
  const comments = useComments(id, state === 'success', commentsRetry)
  const returnPath = id ? `/posts/${id}` : '/feed'

  useEffect(() => { setCommentCount(post?.commentCount) }, [post?.commentCount, post?.id])

  useEffect(() => {
    if (!id || !validId || !isAuthenticated) { setLike(undefined); return }
    const controller = new AbortController()
    setIsLikeLoading(true)
    void getLikeState(id, authorizedRequest, controller.signal).then((result) => {
      if (!controller.signal.aborted) setLike(result)
    }).catch(() => {
      if (!controller.signal.aborted) setLike(undefined)
    }).finally(() => {
      if (!controller.signal.aborted) setIsLikeLoading(false)
    })
    return () => controller.abort()
  }, [authorizedRequest, id, isAuthenticated, validId])

  function goToLogin() { navigate('/login', { state: { from: returnPath } }) }
  async function handleLike() {
    if (!isAuthenticated) { goToLogin(); return }
    if (!id || likeRequestRef.current) return
    likeRequestRef.current = true
    setIsLikeUpdating(true)
    setActionError(undefined)
    try {
      setLike(await updateLike(id, !(like?.liked ?? false), authorizedRequest))
    } catch {
      setActionError('Não foi possível atualizar a curtida. Tente novamente.')
    } finally {
      likeRequestRef.current = false
      setIsLikeUpdating(false)
    }
  }
  async function handleComment(content: string) {
    if (!isAuthenticated) { goToLogin(); return }
    if (!id || commentRequestRef.current) return
    commentRequestRef.current = true
    setIsCommentSubmitting(true)
    try {
      comments.prepend(await createComment(id, content, authorizedRequest))
      setCommentCount((current) => (current ?? post?.commentCount ?? 0) + 1)
    } finally {
      commentRequestRef.current = false
      setIsCommentSubmitting(false)
    }
  }

  let content: React.ReactNode
  if (!validId) content = <StateMessage title="Publicação inválida" message="O endereço desta publicação não é válido." />
  else if (state === 'loading') content = <p className="rounded-lg bg-surface p-8 text-center text-[#bcbcbc]" role="status">Carregando publicação…</p>
  else if (state === 'not-found') content = <StateMessage title="Publicação não encontrada" message="Esta publicação pode ter sido removida ou não existe." />
  else if (state === 'error') content = <StateMessage action={() => setRetry((value) => value + 1)} title="Não foi possível carregar a publicação" message="Tente novamente em alguns instantes." />
  else if (post) content = <><PostDetailCard commentCount={commentCount} isLiked={like?.liked} isLikeLoading={status === 'initializing' || isLikeLoading} isLikeUpdating={isLikeUpdating} likeCount={like?.likeCount} onLike={() => void handleLike()} onShare={() => void share(post.title)} post={post} />{actionError ? <p className="mt-3 text-sm text-red-300" role="alert">{actionError}</p> : null}{shareMessage ? <p aria-live="polite" className="mt-3 text-sm text-[#bfffc3]" role="status">{shareMessage}</p> : null}<CommentsPanel comments={comments.data} isAuthenticated={isAuthenticated} isSubmitting={isCommentSubmitting} onPageChange={comments.setPage} onSubmit={handleComment} returnPath={returnPath} state={comments.state} /></>
  else content = null

  return <FeedTemplate>{content}</FeedTemplate>
}

function StateMessage({ action, message, title }: { action?: () => void; message: string; title: string }) {
  return <section className="rounded-lg bg-surface p-8 text-center" aria-labelledby="post-state-title"><h1 className="text-2xl font-semibold" id="post-state-title">{title}</h1><p className="mt-3 text-[#bcbcbc]">{message}</p>{action ? <button className="mt-6 rounded border border-accent px-4 py-2 font-semibold text-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" onClick={action} type="button">Tentar novamente</button> : null}</section>
}
