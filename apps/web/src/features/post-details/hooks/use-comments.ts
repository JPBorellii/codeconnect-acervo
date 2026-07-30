import { useEffect, useState } from 'react'
import { ApiError } from '../../../services/http/ApiError'
import { getComments } from '../api/post-details.service'
import type { PaginatedComments, PublicComment } from '../types/post-details.types'

type CommentsState = 'idle' | 'loading' | 'success' | 'error'

export function useComments(postId: string | undefined, enabled: boolean, retry: number) {
  const [data, setData] = useState<PaginatedComments>()
  const [state, setState] = useState<CommentsState>('idle')
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [postId])
  useEffect(() => {
    if (!enabled || !postId) return
    const controller = new AbortController()
    setState('loading')
    void getComments(postId, page, 12, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      setData(result)
      setState('success')
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      if (error instanceof ApiError && error.status === 404) return
      setState('error')
    })
    return () => controller.abort()
  }, [enabled, page, postId, retry])

  function prepend(comment: PublicComment) {
    setData((current) => {
      if (!current || current.items.some((item) => item.id === comment.id)) return current
      return {
        items: [...current.items, comment],
        meta: { ...current.meta, total: current.meta.total + 1 },
      }
    })
  }

  return { data, page, prepend, setPage, state }
}
