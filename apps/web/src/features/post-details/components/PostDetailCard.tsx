import { useState } from 'react'
import type { PostDetail } from '../types/post-details.types'
import { formatDate, parsePostContent } from '../utils/post-content'

type PostDetailCardProps = {
  isLiked?: boolean
  likeCount?: number
  commentCount?: number
  isLikeLoading: boolean
  isLikeUpdating: boolean
  onLike: () => void
  onShare: () => void
  post: PostDetail
}

export function PostDetailCard({ commentCount, isLiked, isLikeLoading, isLikeUpdating, likeCount, onLike, onShare, post }: PostDetailCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const date = formatDate(post.createdAt)
  const showImage = Boolean(post.thumbnailUrl) && !imageFailed
  return <article className="overflow-hidden rounded-lg bg-surface shadow-sm">
    <div className="aspect-[1.9/1] bg-[#3e3e3f] p-2.5 sm:p-3 lg:p-4">
      {showImage ? <img alt={`Imagem de capa do post ${post.title}`} className="h-full w-full rounded object-cover" onError={() => setImageFailed(true)} src={post.thumbnailUrl ?? undefined} /> : <div aria-label="Post sem imagem de capa" className="grid h-full place-items-center rounded bg-[#132e35] text-[#bfffc3]" role="img">CodeConnect</div>}
    </div>
    <div className="p-3.5 sm:p-5 lg:p-6">
      <h1 className="text-xl font-semibold leading-7 text-copy sm:text-2xl sm:leading-8 lg:text-3xl lg:leading-tight">{post.title}</h1>
      <div className="mt-3 space-y-3 whitespace-pre-wrap break-words text-[13px] leading-5 text-[#e1e1e1] sm:mt-4 sm:space-y-4 sm:text-sm sm:leading-6 lg:text-base">{parsePostContent(post.content).map((block, index) => block.type === 'code' ? <pre className="overflow-x-auto rounded bg-page p-3 text-xs leading-5 text-[#bfffc3] sm:p-4 sm:text-sm" key={`${block.type}-${index}`}><code>{block.value}</code></pre> : <p key={`${block.type}-${index}`}>{block.value}</p>)}</div>
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-[#bcbcbc] sm:mt-6 sm:gap-3 sm:pt-4 sm:text-sm lg:mt-7 lg:gap-4">
        <span>Por <strong className="font-semibold text-copy">@{post.author.name}</strong>{date ? ` · ${date}` : ''}</span>
        <div aria-label={`${likeCount ?? post.likeCount} curtidas e ${commentCount ?? post.commentCount} comentários`} className="flex items-center gap-1 sm:gap-3">
          <button aria-label={isLiked ? 'Remover curtida' : 'Curtir publicação'} aria-pressed={isLiked} className="min-h-11 rounded px-2 text-[#bfffc3] hover:bg-white/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 sm:px-3" disabled={isLikeLoading || isLikeUpdating} onClick={onLike} type="button">{isLiked ? '♥' : '♡'} {likeCount ?? post.likeCount}</button>
          <span aria-hidden="true">▣ {commentCount ?? post.commentCount}</span>
          <button className="min-h-11 rounded px-2 text-[#bfffc3] hover:bg-white/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-3" onClick={onShare} type="button">↗ Compartilhar</button>
        </div>
      </footer>
    </div>
  </article>
}
