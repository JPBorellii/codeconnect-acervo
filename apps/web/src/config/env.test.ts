import { describe, expect, it } from 'vitest'
import { getApiUrl } from './env'

describe('getApiUrl', () => {
  it('uses /api by default', () => expect(getApiUrl(undefined)).toBe('/api'))
  it('accepts a relative path', () => expect(getApiUrl('/backend')).toBe('/backend'))
  it('accepts an absolute HTTP URL', () => expect(getApiUrl('https://api.example.com')).toBe('https://api.example.com'))
  it('removes trailing slashes', () => expect(getApiUrl('/api/')).toBe('/api'))
  it('rejects invalid values', () => expect(() => getApiUrl('ftp://api.example.com')).toThrow('VITE_API_URL'))
})
