import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext, type AuthStatus } from './auth-context'
import { SessionValidationError } from './auth-errors'
import { ApiError } from '../http/ApiError'
import { authService } from './auth.service'
import { authStorage } from './auth-storage'
import type { LoginRequest, PublicUser } from './auth.types'
import { apiClient, type ApiRequestOptions } from '../http/apiClient'

function isPublicUser(value: unknown): value is PublicUser {
  if (!value || typeof value !== 'object') return false
  const user = value as Record<string, unknown>
  return typeof user.id === 'string' && typeof user.name === 'string'
    && typeof user.email === 'string' && typeof user.createdAt === 'string'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [user, setUser] = useState<PublicUser>()
  const mountedRef = useRef(true)
  const initializationStartedRef = useRef(false)

  const clearSession = useCallback(() => {
    authStorage.clearAccessToken()
    if (!mountedRef.current) return
    setUser(undefined)
    setStatus('anonymous')
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    const accessToken = authStorage.getAccessToken()
    if (!accessToken) {
      if (mountedRef.current) {
        setUser(undefined)
        setStatus('anonymous')
      }
      return undefined
    }
    try {
      const currentUser = await authService.getMe(accessToken)
      if (!isPublicUser(currentUser)) throw new Error('Invalid user response')
      if (mountedRef.current) {
        setUser(currentUser)
        setStatus('authenticated')
      }
      return currentUser
    } catch {
      clearSession()
      return undefined
    }
  }, [clearSession])

  useEffect(() => {
    mountedRef.current = true
    if (!initializationStartedRef.current) {
      initializationStartedRef.current = true
      void refreshCurrentUser()
    }
    return () => { mountedRef.current = false }
  }, [refreshCurrentUser])

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authService.login(request)
    let currentUser: PublicUser
    try {
      currentUser = await authService.getMe(response.accessToken)
      if (!isPublicUser(currentUser)) throw new Error('Invalid user response')
    } catch {
      throw new SessionValidationError()
    }
    authStorage.setAccessToken(response.accessToken)
    if (mountedRef.current) {
      setUser(currentUser)
      setStatus('authenticated')
    }
    return currentUser
  }, [])

  const logout = useCallback(() => {
    clearSession()
    navigate('/feed', { replace: true })
  }, [clearSession, navigate])

  const authorizedRequest = useCallback(async <T,>(path: string, options: ApiRequestOptions = {}) => {
    const accessToken = authStorage.getAccessToken()
    if (!accessToken) throw new SessionValidationError()
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)
    try {
      return await apiClient<T>(path, { ...options, headers })
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) clearSession()
      throw error
    }
  }, [clearSession])

  return <AuthContext.Provider value={{ authorizedRequest, isAuthenticated: status === 'authenticated', login, logout, refreshCurrentUser, status, user }}>{children}</AuthContext.Provider>
}
