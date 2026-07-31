import type { PaginatedPosts, PostSummary } from '../feed/feed.types'

export type ProfilePosts = PaginatedPosts

function isPostSummary(value: unknown): value is PostSummary {
  if (!value || typeof value !== 'object') return false
  const post = value as Record<string, unknown>
  if (typeof post.id !== 'string' || typeof post.title !== 'string' || typeof post.excerpt !== 'string') return false
  if (post.thumbnailUrl !== null && typeof post.thumbnailUrl !== 'string') return false
  if (typeof post.commentCount !== 'number' || typeof post.likeCount !== 'number' || typeof post.createdAt !== 'string') return false
  if (!post.author || typeof post.author !== 'object') return false
  const author = post.author as Record<string, unknown>
  const allowedAuthorFields = Object.keys(author).every((key) => key === 'id' || key === 'name')
  return allowedAuthorFields && typeof author.id === 'string' && typeof author.name === 'string'
}

export function isProfilePosts(value: unknown): value is ProfilePosts {
  if (!value || typeof value !== 'object') return false
  const result = value as Record<string, unknown>
  if (!Array.isArray(result.items) || !result.meta || typeof result.meta !== 'object') return false
  const meta = result.meta as Record<string, unknown>
  const validMeta = ['page', 'limit', 'total', 'totalPages'].every((key) => typeof meta[key] === 'number' && Number.isFinite(meta[key]))
  return validMeta && result.items.every(isPostSummary)
}
