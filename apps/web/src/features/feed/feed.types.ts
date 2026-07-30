export type PostSummary = {
  id: string
  title: string
  excerpt: string
  thumbnailUrl: string | null
  author: { id: string; name: string }
  commentCount: number
  likeCount: number
  createdAt: string
}

export type PaginatedPosts = {
  items: PostSummary[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
