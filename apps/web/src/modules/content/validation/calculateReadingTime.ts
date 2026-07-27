const WORDS_PER_MINUTE = 220

function collectText(value: unknown, parts: string[]): void {
  if (typeof value === 'string') {
    parts.push(value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, parts))
    return
  }
  if (!value || typeof value !== 'object') return

  for (const [key, child] of Object.entries(value)) {
    if (key === 'text' && typeof child === 'string') {
      parts.push(child)
    } else if (key === 'children' || key === 'root') {
      collectText(child, parts)
    }
  }
}

export function extractRichTextPlainText(value: unknown): string {
  const parts: string[] = []
  collectText(value, parts)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export function calculateReadingTime(value: unknown): number {
  const plainText = extractRichTextPlainText(value)
  if (!plainText) return 1
  return Math.max(1, Math.ceil(plainText.split(/\s+/).length / WORDS_PER_MINUTE))
}
