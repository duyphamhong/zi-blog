import { describe, expect, it } from 'vitest'

import {
  hashMarkdownSource,
  MarkdownImportError,
  parseZiBlogMarkdown,
} from '@/modules/content/markdown-import'

function expectImportError(operation: () => unknown, code: MarkdownImportError['code']): void {
  try {
    operation()
  } catch (error) {
    expect(error).toBeInstanceOf(MarkdownImportError)
    expect(error).toMatchObject({ code })
    return
  }
  throw new Error(`Expected MarkdownImportError ${code}`)
}

describe('parseZiBlogMarkdown', () => {
  it('parses all supported metadata and preserves the Markdown body', () => {
    const result = parseZiBlogMarkdown(
      [
        'TITLE: Safe Payload imports',
        'SLUG: safe-payload-imports',
        'EXCERPT: A sufficiently descriptive article summary.',
        'SEO_TITLE: Payload Markdown import',
        'SEO_DESCRIPTION: Convert Markdown into structured Lexical content.',
        'CONTENT:',
        '',
        '## First section',
        '',
        'Body text.',
      ].join('\n'),
    )

    expect(result).toEqual({
      content: '\n## First section\n\nBody text.',
      excerpt: 'A sufficiently descriptive article summary.',
      seoDescription: 'Convert Markdown into structured Lexical content.',
      seoTitle: 'Payload Markdown import',
      slug: 'safe-payload-imports',
      title: 'Safe Payload imports',
    })
  })

  it('splits metadata at the first colon', () => {
    const result = parseZiBlogMarkdown(
      'TITLE: Payload: safe imports\nEXCERPT: Context: details: result\nCONTENT:\nBody',
    )
    expect(result.title).toBe('Payload: safe imports')
    expect(result.excerpt).toBe('Context: details: result')
  })

  it('normalizes CRLF input while preserving body line structure', () => {
    const result = parseZiBlogMarkdown('TITLE: CRLF\r\nCONTENT:\r\n\r\nLine one\r\nLine two\r\n')
    expect(result.content).toBe('\nLine one\nLine two\n')
  })

  it('allows optional metadata to be absent', () => {
    expect(parseZiBlogMarkdown('CONTENT:\nBody')).toEqual({ content: 'Body' })
  })

  it('rejects a missing CONTENT delimiter', () => {
    expectImportError(
      () => parseZiBlogMarkdown('TITLE: Missing delimiter\nBody'),
      'MISSING_CONTENT_DELIMITER',
    )
  })

  it('rejects empty content after CONTENT', () => {
    expectImportError(() => parseZiBlogMarkdown('CONTENT:\n \n'), 'EMPTY_CONTENT')
  })

  it('preserves fenced code and CONTENT text in the article body', () => {
    const result = parseZiBlogMarkdown(
      [
        'CONTENT:',
        '```text',
        'CONTENT:',
        '```',
        '',
        'The word CONTENT: remains ordinary prose here.',
      ].join('\n'),
    )
    expect(result.content).toContain('```text\nCONTENT:\n```')
    expect(result.content).toContain('CONTENT: remains ordinary prose')
  })

  it('ignores CONTENT inside a preamble fence and finds the later delimiter', () => {
    const result = parseZiBlogMarkdown(
      ['```text', 'CONTENT:', '```', 'TITLE: Real title', 'CONTENT:', 'Body'].join('\n'),
    )
    expect(result).toMatchObject({ content: 'Body', title: 'Real title' })
  })

  it('ignores unknown metadata keys', () => {
    const result = parseZiBlogMarkdown('AUTHOR: Not mapped\nTITLE: Known\nCONTENT:\nBody')
    expect(result).toEqual({ content: 'Body', title: 'Known' })
    expect(result).not.toHaveProperty('author')
  })

  it('preserves leading, internal, and trailing body whitespace', () => {
    const result = parseZiBlogMarkdown('CONTENT:\n\n  indented\n\nfinal  \n')
    expect(result.content).toBe('\n  indented\n\nfinal  \n')
  })

  it('rejects empty required metadata values', () => {
    expectImportError(
      () => parseZiBlogMarkdown('TITLE: \nCONTENT:\nBody'),
      'EMPTY_REQUIRED_METADATA',
    )
  })

  it('rejects ATX and setext H1 headings outside fences', () => {
    expectImportError(() => parseZiBlogMarkdown('CONTENT:\n# H1'), 'H1_NOT_ALLOWED')
    expectImportError(() => parseZiBlogMarkdown('CONTENT:\nSetext H1\n========='), 'H1_NOT_ALLOWED')
  })

  it('allows H1-looking text inside fenced code', () => {
    expect(parseZiBlogMarkdown('CONTENT:\n~~~md\n# Example only\n~~~').content).toContain(
      '# Example only',
    )
  })

  it('rejects non-string runtime input', () => {
    expectImportError(() => parseZiBlogMarkdown(42), 'INVALID_SOURCE_TYPE')
  })
})

describe('hashMarkdownSource', () => {
  it('is deterministic for identical input', () => {
    expect(hashMarkdownSource('CONTENT:\nBody')).toBe(hashMarkdownSource('CONTENT:\nBody'))
  })

  it('treats LF and CRLF as equivalent', () => {
    expect(hashMarkdownSource('TITLE: Test\r\nCONTENT:\r\nBody')).toBe(
      hashMarkdownSource('TITLE: Test\nCONTENT:\nBody'),
    )
  })

  it('changes when body content changes', () => {
    expect(hashMarkdownSource('CONTENT:\nOne')).not.toBe(hashMarkdownSource('CONTENT:\nTwo'))
  })

  it('changes when metadata changes', () => {
    expect(hashMarkdownSource('TITLE: One\nCONTENT:\nBody')).not.toBe(
      hashMarkdownSource('TITLE: Two\nCONTENT:\nBody'),
    )
  })
})
