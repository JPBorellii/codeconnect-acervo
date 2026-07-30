import { Link } from 'react-router'
import { FeedTemplate } from '../templates/FeedTemplate'

export function ProtectedPlaceholderPage({ title }: { title: string }) {
  return <FeedTemplate><section aria-labelledby="placeholder-title">
    <h1 className="text-2xl font-semibold" id="placeholder-title">{title}</h1>
    <p className="mt-4">Esta tela será implementada na próxima fase.</p>
    <Link className="mt-6 inline-block text-accent underline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" to="/feed">Voltar ao feed</Link>
  </section></FeedTemplate>
}
