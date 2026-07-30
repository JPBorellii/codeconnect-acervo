import { useEffect, useState } from 'react'

type PublishPreviewProps = {
  authorName: string
  content: string
  thumbnailUrl: string
  title: string
}

export function PublishPreview({ authorName, content, thumbnailUrl, title }: PublishPreviewProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = thumbnailUrl.trim()
  useEffect(() => { setImageFailed(false) }, [imageUrl])
  const hasImage = /^https?:\/\//iu.test(imageUrl) && !imageFailed
  return <section aria-label="Prévia da publicação" className="overflow-hidden rounded-lg bg-surface shadow-sm">
    <div className="aspect-[1.9/1] bg-[#3e3e3f] p-3">
      {hasImage ? <img alt="Prévia da imagem de capa" className="h-full w-full rounded object-cover" onError={() => setImageFailed(true)} src={imageUrl} /> : <div aria-label="Post sem imagem de capa" className="grid h-full w-full place-items-center rounded bg-[#132e35] text-sm text-[#bfffc3]" role="img">CodeConnect</div>}
    </div>
    <div className="min-h-58 p-4">
      <h2 className="text-base font-semibold leading-6">{title || 'Título da publicação'}</h2>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-[#bcbcbc]">{content || 'O conteúdo aparecerá aqui.'}</p>
      <footer className="mt-8 flex justify-between text-xs text-[#bcbcbc]"><span aria-label="0 curtidas e 0 comentários">♡ 0 &nbsp; ▣ 0</span><span className="max-w-36 truncate font-medium">@{authorName}</span></footer>
    </div>
  </section>
}
