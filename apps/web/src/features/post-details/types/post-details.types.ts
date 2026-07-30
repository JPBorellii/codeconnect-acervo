export type PublicAuthor = { id: string; name: string }

export type PostDetail = {
  id: string
  title: string
  content: string
  thumbnailUrl: string | null
  author: PublicAuthor
  commentCount: number
  likeCount: number
  createdAt: string
}

export type PublicComment = {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: PublicAuthor
}

export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number }
export type PaginatedComments = { items: PublicComment[]; meta: PaginationMeta }
export type LikeState = { liked: boolean; likeCount: number }
