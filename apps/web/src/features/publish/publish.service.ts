import type { AuthorizedRequest } from '../../services/auth/auth-context'
import type { CreatedPost, CreatePostRequest } from './publish.types'

export function createPost(request: CreatePostRequest, authorizedRequest: AuthorizedRequest) {
  return authorizedRequest<CreatedPost>('/posts', { body: request, method: 'POST' })
}
