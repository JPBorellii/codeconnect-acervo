import { useState } from 'react'
import { Link } from 'react-router'
import type { PostSummary } from '../../features/feed/feed.types'

type PostCardProps = { post: PostSummary }

export function PostCard({ post }: PostCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const canShowImage = Boolean(post.thumbnailUrl) && !imageFailed

  return (
    <article className="overflow-hidden rounded-lg bg-surface text-copy shadow-sm">
      <Link aria-label={`Abrir publicação: ${post.title}`} className="block aspect-[1.9/1] bg-[#3e3e3f] p-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent" to={`/posts/${post.id}`}>
        {canShowImage ? (
          <img alt={`Imagem de capa do post ${post.title}`} className="h-full w-full rounded object-cover" onError={() => setImageFailed(true)} src={post.thumbnailUrl ?? undefined} />
        ) : (
          <div aria-label="Post sem imagem de capa" className="grid h-full w-full place-items-center rounded bg-[#132e35] text-sm text-[#bfffc3]" role="img">CodeConnect</div>
        )}
      </Link>
      <div className="flex min-h-58 flex-col p-4">
        <h2 className="text-base font-semibold leading-6"><Link className="rounded focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" to={`/posts/${post.id}`}>{post.title}</Link></h2>
        <p className="mt-2 line-clamp-4 text-sm leading-5 text-[#bcbcbc]">{post.excerpt}</p>
        <footer className="mt-auto flex items-end justify-between pt-8 text-xs text-[#bcbcbc]">
          <div aria-label={`${post.likeCount} curtidas e ${post.commentCount} comentários`} className="flex gap-4" role="group">
            <span aria-hidden="true">♡ {post.likeCount}</span>
            <span aria-hidden="true">▣ {post.commentCount}</span>
          </div>
          <span className="max-w-36 truncate font-medium">@{post.author.name}</span>
        </footer>
        <Link className="mt-4 w-fit text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" to={`/posts/${post.id}`}>Ver publicação</Link>
      </div>
    </article>
  )
}
