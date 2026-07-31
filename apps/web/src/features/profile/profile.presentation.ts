export function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts.slice(0, 2).map((part) => Array.from(part)[0]?.toLocaleUpperCase('pt-BR') ?? '').join('') || '?'
}

export function memberSince(createdAt: string): string {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Membro desde data não informada'
  return `Membro desde ${new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC', year: 'numeric' }).format(date)}`
}
