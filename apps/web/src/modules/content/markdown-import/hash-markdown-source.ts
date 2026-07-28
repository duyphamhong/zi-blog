import { createHash } from 'node:crypto'

export function normalizeMarkdownLineEndings(source: string): string {
  return source.replace(/\r\n?/g, '\n')
}

export function hashMarkdownSource(source: string): string {
  return createHash('sha256').update(normalizeMarkdownLineEndings(source), 'utf8').digest('hex')
}
