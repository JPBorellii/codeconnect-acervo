import { useEffect, useState } from 'react'
import { ApiError } from '../../../services/http/ApiError'
import { getPost } from '../api/post-details.service'
import type { PostDetail } from '../types/post-details.types'

export type PostLoadState = 'loading' | 'success' | 'not-found' | 'error'

export function usePost(id: string | undefined, isValidId: boolean, retry: number) {
  const [post, setPost] = useState<PostDetail>()
  const [state, setState] = useState<PostLoadState>('loading')

  useEffect(() => {
    if (!isValidId || !id) return
    const controller = new AbortController()
    setPost(undefined)
    setState('loading')
    void getPost(id, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      setPost(result)
      setState('success')
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      setState(error instanceof ApiError && error.status === 404 ? 'not-found' : 'error')
    })
    return () => controller.abort()
  }, [id, isValidId, retry])

  return { post, state }
}
