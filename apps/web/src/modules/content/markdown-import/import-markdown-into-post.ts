import { normalizeSlug } from '@/modules/content/validation'

import { hashMarkdownSource } from './hash-markdown-source'
import { MarkdownImportError } from './markdown-import.errors'
import type {
  ImportMarkdownIntoPostInput,
  ImportMarkdownIntoPostResult,
  LexicalDocument,
  MarkdownImportPostData,
} from './markdown-import.types'
import { parseZiBlogMarkdown } from './parse-zi-blog-markdown'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isLexicalDocument(value: unknown): value is LexicalDocument {
  if (!isRecord(value) || !isRecord(value.root)) return false
  return value.root.type === 'root' && Array.isArray(value.root.children)
}

function resolveEffectiveSource(
  data: MarkdownImportPostData,
  originalDoc: MarkdownImportPostData | null | undefined,
): unknown {
  return Object.hasOwn(data, 'markdownSource') ? data.markdownSource : originalDoc?.markdownSource
}

export function importMarkdownIntoPost({
  convertMarkdown,
  data,
  operation,
  originalDoc,
}: ImportMarkdownIntoPostInput): ImportMarkdownIntoPostResult {
  if (data.importMarkdownIntoContent !== true) {
    return { data, imported: false, reason: 'not-requested' }
  }

  const existingDoc = operation === 'update' ? originalDoc : undefined
  const source = resolveEffectiveSource(data, existingDoc)

  if (source === null || source === undefined || (typeof source === 'string' && !source.trim())) {
    return {
      data: {
        ...data,
        importMarkdownIntoContent: false,
      },
      imported: false,
      reason: 'empty-source',
    }
  }

  if (typeof source !== 'string') {
    throw new MarkdownImportError('INVALID_SOURCE_TYPE')
  }

  const parsed = parseZiBlogMarkdown(source)
  let content: unknown

  try {
    content = convertMarkdown(parsed.content)
  } catch (error) {
    throw new MarkdownImportError('LEXICAL_CONVERSION_FAILED', { cause: error })
  }

  if (!isLexicalDocument(content)) {
    throw new MarkdownImportError('INVALID_LEXICAL_DOCUMENT')
  }

  const originalSeo = isRecord(existingDoc?.seo) ? existingDoc.seo : {}
  const incomingSeo = isRecord(data.seo) ? data.seo : {}
  const importedSeo: Record<string, unknown> = {}
  if (parsed.seoTitle !== undefined) importedSeo.metaTitle = parsed.seoTitle
  if (parsed.seoDescription !== undefined) importedSeo.metaDescription = parsed.seoDescription

  const nextData: MarkdownImportPostData = {
    ...data,
    content,
    importMarkdownIntoContent: false,
    lastImportedMarkdownHash: hashMarkdownSource(source),
  }

  if (parsed.title !== undefined) nextData.title = parsed.title
  if (parsed.slug !== undefined) nextData.slug = normalizeSlug(parsed.slug)
  if (parsed.excerpt !== undefined) nextData.excerpt = parsed.excerpt
  if (Object.keys(importedSeo).length) {
    nextData.seo = {
      ...originalSeo,
      ...incomingSeo,
      ...importedSeo,
    }
  }

  return {
    data: nextData,
    imported: true,
  }
}
