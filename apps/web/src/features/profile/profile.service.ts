import type { AuthorizedRequest } from '../../services/auth/auth-context'
import { isProfilePosts, type ProfilePosts } from './profile.types'

export async function listProfilePosts(page: number, authorizedRequest: AuthorizedRequest, signal: AbortSignal): Promise<ProfilePosts> {
  const result = await authorizedRequest<unknown>(`/profile/me/posts?page=${page}&limit=12`, { cache: 'no-store', signal })
  if (!isProfilePosts(result)) throw new Error('Invalid profile posts response')
  return result
}
