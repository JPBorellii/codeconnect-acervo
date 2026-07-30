export type CreatePostRequest = {
  title: string
  content: string
  thumbnailUrl?: string
}

export type CreatedPost = {
  id: string
  title: string
  content: string
  thumbnailUrl: string | null
  author: { id: string; name: string }
  commentCount: number
  likeCount: number
  createdAt: string
}
