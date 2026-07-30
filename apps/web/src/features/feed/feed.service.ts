import { apiClient } from '../../services/http/apiClient'
import type { PaginatedPosts } from './feed.types'

type ListPostsParams = { page: number; limit: number; query: string }

export function listPosts({ page, limit, query }: ListPostsParams) {
  const params = new URLSearchParams({ limit: String(limit), page: String(page) })
  if (query.trim()) params.set('q', query.trim())
  return apiClient<PaginatedPosts>(`/posts?${params.toString()}`)
}
