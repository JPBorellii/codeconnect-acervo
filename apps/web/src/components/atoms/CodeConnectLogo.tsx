import { Link } from 'react-router'

export function CodeConnectLogo() {
  return (
    <Link aria-label="CodeConnect: ir para o feed" className="inline-flex items-center gap-2 text-copy" to="/feed">
      <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-md border-2 border-accent text-sm font-bold text-accent">⌘</span>
      <span className="text-lg leading-[.8] tracking-tight">code<br />connect</span>
    </Link>
  )
}
