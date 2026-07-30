import { apiUrl } from '../../config/env'
import { ApiError, type ApiErrorCategory } from './ApiError'

export type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  headers?: HeadersInit
}

const timeoutMs = 10_000

function buildUrl(path: string) {
  if (!path.startsWith('/')) throw new ApiError('Caminho da API inválido.', 'unknown')
  return `${apiUrl === '/' ? '' : apiUrl}${path}`
}

function categoryForStatus(status: number): ApiErrorCategory {
  if (status === 400) return 'validation'
  if (status === 401 || status === 403) return 'unauthorized'
  if (status === 409) return 'conflict'
  return 'unknown'
}

function messageFor(category: ApiErrorCategory) {
  const messages: Record<ApiErrorCategory, string> = {
    conflict: 'Não foi possível concluir a solicitação.',
    network: 'Não foi possível conectar ao servidor.',
    timeout: 'A solicitação demorou demais.',
    unauthorized: 'Não autorizado.',
    unknown: 'Não foi possível concluir a solicitação.',
    validation: 'Revise os dados informados.',
  }
  return messages[category]
}

async function readJson(response: Response): Promise<unknown> {
  if (response.status === 204 || response.headers.get('content-length') === '0') return undefined
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError('Resposta inválida do servidor.', 'unknown', response.status)
  }
}

export async function apiClient<T>(
  path: string,
  { body, headers, signal, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  const abortRequest = () => controller.abort()
  signal?.addEventListener('abort', abortRequest, { once: true })
  const requestHeaders = new Headers(headers)
  const hasBody = body !== undefined

  if (hasBody && !requestHeaders.has('Content-Type')) requestHeaders.set('Content-Type', 'application/json')
  if (!requestHeaders.has('Accept')) requestHeaders.set('Accept', 'application/json')

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      body: hasBody ? JSON.stringify(body) : undefined,
      headers: requestHeaders,
      signal: controller.signal,
    })
    const data = await readJson(response)
    if (!response.ok) {
      const category = categoryForStatus(response.status)
      throw new ApiError(messageFor(category), category, response.status)
    }
    return data as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(messageFor('timeout'), 'timeout')
    }
    throw new ApiError(messageFor('network'), 'network')
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', abortRequest)
  }
}
