import type { AuthorizedRequest } from '../../../services/auth/auth-context'
import { apiClient } from '../../../services/http/apiClient'
import type { LikeState, PaginatedComments, PostDetail, PublicComment } from '../types/post-details.types'

export function getPost(id: string, signal?: AbortSignal) {
  return apiClient<PostDetail>(`/posts/${id}`, { signal })
}

export function getComments(id: string, page: number, limit: number, signal?: AbortSignal) {
  return apiClient<PaginatedComments>(`/posts/${id}/comments?page=${page}&limit=${limit}`, { signal })
}

export function getLikeState(id: string, request: AuthorizedRequest, signal?: AbortSignal) {
  return request<LikeState>(`/posts/${id}/like`, { signal })
}

export function updateLike(id: string, liked: boolean, request: AuthorizedRequest) {
  return request<LikeState>(`/posts/${id}/like`, { method: liked ? 'PUT' : 'DELETE' })
}

export function createComment(id: string, content: string, request: AuthorizedRequest) {
  return request<PublicComment>(`/posts/${id}/comments`, { body: { content }, method: 'POST' })
}
