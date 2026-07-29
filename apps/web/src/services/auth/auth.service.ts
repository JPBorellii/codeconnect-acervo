import { apiClient } from '../http/apiClient'
import type { PublicUser, RegisterRequest } from './auth.types'

export function register(request: RegisterRequest): Promise<PublicUser> {
  return apiClient<PublicUser>('/auth/register', { body: request, method: 'POST' })
}

export const authService = { register }
