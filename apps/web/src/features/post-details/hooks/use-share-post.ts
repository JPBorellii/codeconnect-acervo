import { useState } from 'react'

export function useSharePost() {
  const [message, setMessage] = useState<string>()

  async function share(title: string) {
    const url = `${window.location.origin}${window.location.pathname}`
    try {
      if (navigator.share) await navigator.share({ title, url })
      else if (navigator.clipboard) await navigator.clipboard.writeText(url)
      else throw new Error('Clipboard unavailable')
      setMessage('Link da publicação copiado.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setMessage('Não foi possível compartilhar agora.')
    }
  }

  return { message, share }
}
