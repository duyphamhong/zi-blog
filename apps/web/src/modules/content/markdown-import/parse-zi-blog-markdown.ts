import { MarkdownImportError } from './markdown-import.errors'
import { normalizeMarkdownLineEndings } from './hash-markdown-source'
import type { ParsedZiBlogMarkdown } from './markdown-import.types'

const metadataKeys = {
  EXCERPT: 'excerpt',
  SEO_DESCRIPTION: 'seoDescription',
  SEO_TITLE: 'seoTitle',
  SLUG: 'slug',
  TITLE: 'title',
} as const

type Fence = {
  character: '`' | '~'
  length: number
}

function isMetadataKey(value: string): value is keyof typeof metadataKeys {
  return Object.hasOwn(metadataKeys, value)
}

function openingFence(line: string): Fence | null {
  const match = /^ {0,3}(`{3,}|~{3,})/.exec(line)
  if (!match?.[1]) return null
  const marker = match[1]
  return {
    character: marker.startsWith('`') ? '`' : '~',
    length: marker.length,
  }
}

function closesFence(line: string, fence: Fence): boolean {
  const trimmed = line.trim()
  const marker = fence.character.repeat(fence.length)
  if (!trimmed.startsWith(marker)) return false
  const markerLength = trimmed.search(new RegExp(`[^\\${fence.character}]`))
  const actualLength = markerLength === -1 ? trimmed.length : markerLength
  return actualLength >= fence.length && trimmed.slice(actualLength).trim() === ''
}

function findContentDelimiter(lines: string[]): number {
  let fence: Fence | null = null

  for (const [index, line] of lines.entries()) {
    if (fence) {
      if (closesFence(line, fence)) fence = null
      continue
    }

    const nextFence = openingFence(line)
    if (nextFence) {
      fence = nextFence
      continue
    }

    if (/^\s*CONTENT:\s*$/.test(line)) return index
  }

  return -1
}

function assertNoH1(content: string): void {
  const lines = content.split('\n')
  let fence: Fence | null = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ''
    if (fence) {
      if (closesFence(line, fence)) fence = null
      continue
    }

    const nextFence = openingFence(line)
    if (nextFence) {
      fence = nextFence
      continue
    }

    if (/^ {0,3}#(?:[ \t]+|$)/.test(line)) {
      throw new MarkdownImportError('H1_NOT_ALLOWED')
    }

    const nextLine = lines[index + 1]
    if (line.trim() && nextLine && /^ {0,3}=+\s*$/.test(nextLine)) {
      throw new MarkdownImportError('H1_NOT_ALLOWED')
    }
  }
}

export function parseZiBlogMarkdown(source: unknown): ParsedZiBlogMarkdown {
  if (typeof source !== 'string') {
    throw new MarkdownImportError('INVALID_SOURCE_TYPE')
  }

  const normalizedSource = normalizeMarkdownLineEndings(source)
  const lines = normalizedSource.split('\n')
  const delimiterIndex = findContentDelimiter(lines)

  if (delimiterIndex < 0) {
    throw new MarkdownImportError('MISSING_CONTENT_DELIMITER')
  }

  const parsed: ParsedZiBlogMarkdown = {
    content: lines.slice(delimiterIndex + 1).join('\n'),
  }

  for (const line of lines.slice(0, delimiterIndex)) {
    const colonIndex = line.indexOf(':')
    if (colonIndex < 0) continue

    const sourceKey = line.slice(0, colonIndex).trim().toUpperCase()
    if (!isMetadataKey(sourceKey)) continue

    const key = metadataKeys[sourceKey]
    const value = line.slice(colonIndex + 1).trim()
    if (!value && (key === 'title' || key === 'slug' || key === 'excerpt')) {
      throw new MarkdownImportError('EMPTY_REQUIRED_METADATA')
    }
    parsed[key] = value
  }

  if (!parsed.content.trim()) {
    throw new MarkdownImportError('EMPTY_CONTENT')
  }

  assertNoH1(parsed.content)
  return parsed
}
