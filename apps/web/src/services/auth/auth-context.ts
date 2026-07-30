import { createContext } from 'react'
import type { LoginRequest, PublicUser } from './auth.types'

export type AuthStatus = 'initializing' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<PublicUser>
  logout: () => void
  refreshCurrentUser: () => Promise<PublicUser | undefined>
  status: AuthStatus
  user?: PublicUser
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
