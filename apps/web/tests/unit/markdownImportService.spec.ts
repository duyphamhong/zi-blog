import { describe, expect, it, vi } from 'vitest'

import {
  hashMarkdownSource,
  importMarkdownIntoPost,
  MarkdownImportError,
  type MarkdownImportPostData,
} from '@/modules/content/markdown-import'

const SOURCE = [
  'TITLE: Imported title',
  'SLUG: Đường dẫn: mới',
  'EXCERPT: This imported excerpt is long enough for post validation.',
  'SEO_TITLE: Imported SEO title',
  'SEO_DESCRIPTION: Imported SEO description',
  'CONTENT:',
  '## Imported body',
].join('\n')

function lexicalDocument(markdown: string) {
  return {
    root: {
      children: [{ markdown, type: 'paragraph', version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root' as const,
      version: 1,
    },
  }
}

describe('importMarkdownIntoPost', () => {
  it('imports a create request and maps only supported fields', () => {
    const result = importMarkdownIntoPost({
      convertMarkdown: lexicalDocument,
      data: {
        author: 7,
        importMarkdownIntoContent: true,
        markdownSource: SOURCE,
        seo: { canonicalUrl: 'https://example.com/original', noIndex: true },
        status: 'draft',
      },
      operation: 'create',
    })

    expect(result.imported).toBe(true)
    expect(result.data).toMatchObject({
      author: 7,
      content: lexicalDocument('## Imported body'),
      excerpt: 'This imported excerpt is long enough for post validation.',
      importMarkdownIntoContent: false,
      lastImportedMarkdownHash: hashMarkdownSource(SOURCE),
      seo: {
        canonicalUrl: 'https://example.com/original',
        metaDescription: 'Imported SEO description',
        metaTitle: 'Imported SEO title',
        noIndex: true,
      },
      slug: 'duong-dan-moi',
      status: 'draft',
      title: 'Imported title',
    })
    expect(result.data).not.toHaveProperty('category')
  })

  it('imports changed Markdown on update using incoming source', () => {
    const result = importMarkdownIntoPost({
      convertMarkdown: lexicalDocument,
      data: {
        importMarkdownIntoContent: true,
        markdownSource: SOURCE.replace('Imported body', 'Changed body'),
      },
      operation: 'update',
      originalDoc: {
        lastImportedMarkdownHash: hashMarkdownSource(SOURCE),
        markdownSource: SOURCE,
      },
    })
    expect(result.imported).toBe(true)
    expect(result.data.content).toEqual(lexicalDocument('## Changed body'))
  })

  it('does not touch content when import was not requested', () => {
    const manualContent = lexicalDocument('Manual Lexical edit')
    const data = {
      content: manualContent,
      markdownSource: SOURCE,
      title: 'Manual title',
    }
    const convertMarkdown = vi.fn(lexicalDocument)
    const result = importMarkdownIntoPost({
      convertMarkdown,
      data,
      operation: 'update',
      originalDoc: {
        lastImportedMarkdownHash: hashMarkdownSource(SOURCE),
        markdownSource: SOURCE,
      },
    })

    expect(result).toEqual({ data, imported: false, reason: 'not-requested' })
    expect(result.data.content).toBe(manualContent)
    expect(convertMarkdown).not.toHaveBeenCalled()
  })

  it('uses the explicit checkbox as a safe force re-import for unchanged source', () => {
    const convertMarkdown = vi.fn(lexicalDocument)
    const result = importMarkdownIntoPost({
      convertMarkdown,
      data: { importMarkdownIntoContent: true },
      operation: 'update',
      originalDoc: {
        content: lexicalDocument('Manual edit'),
        lastImportedMarkdownHash: hashMarkdownSource(SOURCE),
        markdownSource: SOURCE,
      },
    })

    expect(result.imported).toBe(true)
    expect(convertMarkdown).toHaveBeenCalledWith('## Imported body')
    expect(result.data.content).toEqual(lexicalDocument('## Imported body'))
  })

  it('preserves content when Markdown source is cleared and resets the trigger', () => {
    const content = lexicalDocument('Keep this')
    const result = importMarkdownIntoPost({
      convertMarkdown: lexicalDocument,
      data: {
        content,
        importMarkdownIntoContent: true,
        markdownSource: '',
      },
      operation: 'update',
      originalDoc: { content, markdownSource: SOURCE },
    })

    expect(result).toEqual({
      data: {
        content,
        importMarkdownIntoContent: false,
        markdownSource: '',
      },
      imported: false,
      reason: 'empty-source',
    })
  })

  it('preserves missing metadata and unrelated nested SEO fields', () => {
    const source = 'SEO_TITLE: Updated title only\nCONTENT:\nBody'
    const result = importMarkdownIntoPost({
      convertMarkdown: lexicalDocument,
      data: {
        importMarkdownIntoContent: true,
        markdownSource: source,
        seo: { noIndex: true },
      },
      operation: 'update',
      originalDoc: {
        excerpt: 'Existing excerpt',
        seo: {
          canonicalUrl: 'https://example.com/canonical',
          metaDescription: 'Existing description',
          metaTitle: 'Existing title',
          socialImage: 12,
        },
        title: 'Existing title',
      },
    })

    expect(result.data).not.toHaveProperty('title')
    expect(result.data).not.toHaveProperty('excerpt')
    expect(result.data.seo).toEqual({
      canonicalUrl: 'https://example.com/canonical',
      metaDescription: 'Existing description',
      metaTitle: 'Updated title only',
      noIndex: true,
      socialImage: 12,
    })
  })

  it('does not mutate data or hashes when parsing fails', () => {
    const data: MarkdownImportPostData = {
      content: lexicalDocument('Existing content'),
      importMarkdownIntoContent: true,
      lastImportedMarkdownHash: 'prior-hash',
      markdownSource: 'No delimiter',
    }
    const before = structuredClone(data)

    expect(() =>
      importMarkdownIntoPost({
        convertMarkdown: lexicalDocument,
        data,
        operation: 'update',
        originalDoc: data,
      }),
    ).toThrow(MarkdownImportError)
    expect(data).toEqual(before)
  })

  it('does not mutate data or hashes when conversion fails', () => {
    const data: MarkdownImportPostData = {
      content: lexicalDocument('Existing content'),
      importMarkdownIntoContent: true,
      lastImportedMarkdownHash: 'prior-hash',
      markdownSource: SOURCE,
    }
    const before = structuredClone(data)

    expect(() =>
      importMarkdownIntoPost({
        convertMarkdown: () => {
          throw new Error('converter failure')
        },
        data,
        operation: 'update',
        originalDoc: data,
      }),
    ).toThrowError(expect.objectContaining({ code: 'LEXICAL_CONVERSION_FAILED' }))
    expect(data).toEqual(before)
  })

  it('rejects converter output without a valid root', () => {
    expect(() =>
      importMarkdownIntoPost({
        convertMarkdown: () => ({ root: { children: [], type: 'paragraph' } }),
        data: { importMarkdownIntoContent: true, markdownSource: SOURCE },
        operation: 'create',
      }),
    ).toThrowError(expect.objectContaining({ code: 'INVALID_LEXICAL_DOCUMENT' }))
  })

  it('resolves stored source for an update that submits only the trigger', () => {
    const result = importMarkdownIntoPost({
      convertMarkdown: lexicalDocument,
      data: { importMarkdownIntoContent: true },
      operation: 'update',
      originalDoc: { markdownSource: SOURCE },
    })
    expect(result.imported).toBe(true)
    expect(result.data.lastImportedMarkdownHash).toBe(hashMarkdownSource(SOURCE))
  })

  it('does not inspect stored source for an unrelated partial update', () => {
    const convertMarkdown = vi.fn(lexicalDocument)
    const result = importMarkdownIntoPost({
      convertMarkdown,
      data: { featured: true },
      operation: 'update',
      originalDoc: { markdownSource: SOURCE },
    })
    expect(result).toEqual({
      data: { featured: true },
      imported: false,
      reason: 'not-requested',
    })
    expect(convertMarkdown).not.toHaveBeenCalled()
  })

  it('does not use original document source during create', () => {
    const result = importMarkdownIntoPost({
      convertMarkdown: lexicalDocument,
      data: { importMarkdownIntoContent: true },
      operation: 'create',
      originalDoc: { markdownSource: SOURCE },
    })
    expect(result).toEqual({
      data: { importMarkdownIntoContent: false },
      imported: false,
      reason: 'empty-source',
    })
  })
})
