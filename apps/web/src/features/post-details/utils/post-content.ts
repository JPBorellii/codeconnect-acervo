export type ContentBlock = { type: 'text'; value: string } | { type: 'code'; language: string; value: string }

export function parsePostContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const expression = /```([^\n`]*)\n([\s\S]*?)```/gu
  let offset = 0
  for (const match of content.matchAll(expression)) {
    const index = match.index ?? 0
    if (index > offset) blocks.push({ type: 'text', value: content.slice(offset, index) })
    blocks.push({ language: match[1].trim(), type: 'code', value: match[2] })
    offset = index + match[0].length
  }
  if (offset < content.length || blocks.length === 0) blocks.push({ type: 'text', value: content.slice(offset) })
  return blocks
}

export function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date)
}
