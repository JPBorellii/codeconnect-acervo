export type RegisterRequest = { name: string; email: string; password: string }

export type PublicUser = { id: string; name: string; email: string; createdAt: string }

export type LoginRequest = { email: string; password: string }

export type LoginResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: Pick<PublicUser, 'id' | 'name' | 'email'>
}
