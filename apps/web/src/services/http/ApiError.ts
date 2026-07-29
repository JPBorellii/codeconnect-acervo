export type ApiErrorCategory =
  | 'validation'
  | 'conflict'
  | 'unauthorized'
  | 'network'
  | 'timeout'
  | 'unknown'

export class ApiError extends Error {
  public readonly category: ApiErrorCategory
  public readonly status?: number

  constructor(
    message: string,
    category: ApiErrorCategory,
    status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.category = category
    this.status = status
  }
}
