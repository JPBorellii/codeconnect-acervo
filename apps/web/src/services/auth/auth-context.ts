import { createContext } from 'react'
import type { LoginRequest, PublicUser } from './auth.types'
import type { ApiRequestOptions } from '../http/apiClient'

export type AuthorizedRequest = <T>(path: string, options?: ApiRequestOptions) => Promise<T>

export type AuthStatus = 'initializing' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<PublicUser>
  logout: () => void
  refreshCurrentUser: () => Promise<PublicUser | undefined>
  authorizedRequest: AuthorizedRequest
  status: AuthStatus
  user?: PublicUser
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
