const defaultApiUrl = '/api'

export function getApiUrl(value = import.meta.env.VITE_API_URL): string {
  const apiUrl = value?.trim() || defaultApiUrl

  if (apiUrl.startsWith('/')) return apiUrl.replace(/\/+$/, '') || '/'

  try {
    const url = new URL(apiUrl)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error()
    return apiUrl.replace(/\/+$/, '')
  } catch {
    throw new Error(
      'VITE_API_URL deve ser um caminho relativo iniciado por "/" ou uma URL HTTP(S) absoluta.',
    )
  }
}

export const apiUrl = getApiUrl()
