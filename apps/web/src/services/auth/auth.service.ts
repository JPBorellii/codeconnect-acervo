import { apiClient } from '../http/apiClient'
import type { LoginRequest, LoginResponse, PublicUser, RegisterRequest } from './auth.types'

export function register(request: RegisterRequest): Promise<PublicUser> {
  return apiClient<PublicUser>('/auth/register', { body: request, method: 'POST' })
}

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/auth/login', { body: request, method: 'POST' })
}

export function getMe(accessToken: string): Promise<PublicUser> {
  return apiClient<PublicUser>('/auth/me', {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${accessToken}` },
    method: 'GET',
  })
}

export const authService = { getMe, login, register }
