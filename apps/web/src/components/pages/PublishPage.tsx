import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { PublishPreview } from '../molecules/PublishPreview'
import { FeedTemplate } from '../templates/FeedTemplate'
import { createPost } from '../../features/publish/publish.service'
import { ApiError } from '../../services/http/ApiError'
import { useAuth } from '../../services/auth/use-auth'

const titleMin = 3
const titleMax = 150
const contentMax = 10_000
const imageMax = 2048
type Field = 'title' | 'content' | 'thumbnailUrl'
type Errors = Partial<Record<Field, string>>

function validate(values: { title: string; content: string; thumbnailUrl: string }): Errors {
  const errors: Errors = {}
  const title = values.title.trim()
  const content = values.content.trim()
  const thumbnailUrl = values.thumbnailUrl.trim()
  if (!title) errors.title = 'Informe o título da publicação.'
  else if (title.length < titleMin) errors.title = `O título deve ter pelo menos ${titleMin} caracteres.`
  else if (title.length > titleMax) errors.title = `O título deve ter no máximo ${titleMax} caracteres.`
  if (!content) errors.content = 'Informe o conteúdo da publicação.'
  else if (content.length > contentMax) errors.content = `O conteúdo deve ter no máximo ${contentMax.toLocaleString('pt-BR')} caracteres.`
  if (thumbnailUrl) {
    if (thumbnailUrl.length > imageMax) errors.thumbnailUrl = `A URL da imagem deve ter no máximo ${imageMax.toLocaleString('pt-BR')} caracteres.`
    else try {
      const url = new URL(thumbnailUrl)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') errors.thumbnailUrl = 'Informe uma URL de imagem válida.'
    } catch { errors.thumbnailUrl = 'Informe uma URL de imagem válida.' }
  }
  return errors
}

export function PublishPage() {
  const navigate = useNavigate()
  const { authorizedRequest, user } = useAuth()
  const [values, setValues] = useState({ title: '', content: '', thumbnailUrl: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const submitLock = useRef(false)
  const discardButton = useRef<HTMLButtonElement>(null)
  const titleInput = useRef<HTMLInputElement>(null)
  const contentInput = useRef<HTMLTextAreaElement>(null)
  const imageInput = useRef<HTMLInputElement>(null)
  const dirty = Boolean(values.title || values.content || values.thumbnailUrl)

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    if (dirty) window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function update(field: Field, value: string) { setValues((current) => ({ ...current, [field]: value })); setMessage('') }
  function validateField(field: Field) { setErrors((current) => ({ ...current, [field]: validate(values)[field] })) }
  function reset() { setValues({ title: '', content: '', thumbnailUrl: '' }); setErrors({}); setMessage(''); setIsDiscardDialogOpen(false) }
  function focusFirstError(nextErrors: Errors) {
    if (nextErrors.title) titleInput.current?.focus()
    else if (nextErrors.content) contentInput.current?.focus()
    else if (nextErrors.thumbnailUrl) imageInput.current?.focus()
  }
  function requestDiscard() { if (isSubmitting) return; if (dirty) setIsDiscardDialogOpen(true); else reset() }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitLock.current) return
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { setMessage('Revise os campos destacados.'); focusFirstError(nextErrors); return }
    submitLock.current = true
    setIsSubmitting(true)
    setMessage('Publicando…')
    const title = values.title.trim()
    const content = values.content.trim()
    const thumbnailUrl = values.thumbnailUrl.trim()
    try {
      const post = await createPost(thumbnailUrl ? { title, content, thumbnailUrl } : { title, content }, authorizedRequest)
      if (!post || typeof post.id !== 'string' || !post.id.trim()) throw new Error('Invalid post response')
      reset()
      navigate(`/posts/${post.id}`)
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setMessage('Sua sessão expirou. Entre novamente para publicar.')
        navigate('/login', { replace: true, state: { from: '/publicar' } })
      } else if (error instanceof ApiError && error.status === 400) setMessage('Não foi possível publicar. Revise os dados informados.')
      else setMessage('Não foi possível publicar agora. Tente novamente em alguns instantes.')
    } finally { submitLock.current = false; setIsSubmitting(false) }
  }

  return <FeedTemplate><div className="mx-auto max-w-[1000px] lg:grid lg:grid-cols-2 lg:gap-6">
    <div><h1 className="mb-4 text-2xl font-semibold">Nova publicação</h1><PublishPreview authorName={user?.name ?? 'usuário'} content={values.content} thumbnailUrl={values.thumbnailUrl} title={values.title} /><p className="mt-3 text-sm text-muted">Sem imagem, a prévia utiliza a imagem padrão do CodeConnect.</p></div>
    <form className="mt-8 rounded-lg bg-surface p-5 lg:mt-0" noValidate onSubmit={(event) => void submit(event)}>
      <div className="space-y-5"><FormInput error={errors.title} id="publish-title" label="Título da publicação" maxLength={titleMax} onBlur={() => validateField('title')} onChange={(event) => update('title', event.target.value)} ref={titleInput} required value={values.title} /><Counter current={values.title.length} maximum={titleMax} />
      <FormTextarea error={errors.content} id="publish-content" label="Conteúdo" maxLength={contentMax} onBlur={() => validateField('content')} onChange={(event) => update('content', event.target.value)} ref={contentInput} required value={values.content} /><Counter current={values.content.length} maximum={contentMax} />
      <FormInput error={errors.thumbnailUrl} id="publish-image-url" label="URL da imagem de capa (opcional)" maxLength={imageMax} onBlur={() => validateField('thumbnailUrl')} onChange={(event) => update('thumbnailUrl', event.target.value)} ref={imageInput} type="url" value={values.thumbnailUrl} />
      </div>
      <p aria-live="polite" className="mt-5 text-sm text-[#bfffc3]" role="status">{message}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><button className="rounded-lg border border-accent px-5 py-3 font-semibold text-accent focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:opacity-45" disabled={isSubmitting} onClick={requestDiscard} ref={discardButton} type="button">Descartar</button><button className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:opacity-45" disabled={isSubmitting} type="submit">{isSubmitting ? 'Publicando…' : 'Publicar'}</button></div>
    </form>
    {isDiscardDialogOpen ? <div aria-describedby="discard-description" aria-labelledby="discard-title" aria-modal="true" className="fixed inset-0 z-20 grid place-items-center bg-black/70 p-6" role="dialog"><div className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-xl"><h2 className="text-xl font-semibold" id="discard-title">Descartar alterações?</h2><p className="mt-2 text-muted" id="discard-description">O conteúdo não publicado será apagado.</p><div className="mt-6 flex gap-3"><button autoFocus className="rounded border border-accent px-4 py-2 text-accent" onClick={() => { setIsDiscardDialogOpen(false); discardButton.current?.focus() }} type="button">Cancelar</button><button className="rounded bg-accent px-4 py-2 font-semibold text-accent-ink" onClick={reset} type="button">Descartar</button></div></div></div> : null}
  </div></FeedTemplate>
}

type BaseProps = { error?: string; id: string; label: string; onBlur: () => void; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; value: string; required?: boolean; maxLength: number }
const FormInput = ({ error, id, label, ...props }: BaseProps & { type?: string; ref?: React.Ref<HTMLInputElement> }) => <div><label className="block text-sm text-copy" htmlFor={id}>{label}{props.required ? ' *' : ''}</label><input aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} className="mt-2 w-full rounded bg-field px-4 py-3 text-field-ink placeholder:text-field-placeholder focus-visible:outline-3 focus-visible:outline-accent" id={id} {...props} />{error ? <p className="mt-1 text-sm text-red-300" id={`${id}-error`} role="alert">{error}</p> : null}</div>
const FormTextarea = ({ error, id, label, ...props }: BaseProps & { ref?: React.Ref<HTMLTextAreaElement> }) => <div><label className="block text-sm text-copy" htmlFor={id}>{label}{props.required ? ' *' : ''}</label><textarea aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} className="mt-2 min-h-48 w-full resize-y rounded bg-field px-4 py-3 text-field-ink placeholder:text-field-placeholder focus-visible:outline-3 focus-visible:outline-accent" id={id} {...props} />{error ? <p className="mt-1 text-sm text-red-300" id={`${id}-error`} role="alert">{error}</p> : null}</div>
function Counter({ current, maximum }: { current: number; maximum: number }) { return <p className="-mt-3 text-right text-xs text-muted" aria-live="polite">{current} de {maximum} caracteres</p> }
