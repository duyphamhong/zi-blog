import { commitTransaction, createLocalReq, initTransaction, type Payload } from 'payload'

import { convertMarkdownToPostLexical } from '@/modules/content/markdown-import/convert-markdown-to-post-lexical'
import { MarkdownImportError } from '@/modules/content/markdown-import/markdown-import.errors'
import { parseZiBlogMarkdown } from '@/modules/content/markdown-import/parse-zi-blog-markdown'
import { calculateReadingTime, normalizeSlug } from '@/modules/content/validation'
import { type Actor, isActiveStaff } from '@/modules/identity'
import { type ContentLocale } from '@/modules/platform'
import type { User } from '@/payload-types'

export type MarkdownImportFile = { fileName: string; locale: ContentLocale; source: string }
export type LocalizedPostImportPreview = {
  codeBlockCount: number
  excerpt: string
  headingCount: number
  lexicalContent: unknown
  locale: ContentLocale
  readingTimeMinutes: number
  seoDescription?: string
  seoTitle?: string
  slug: string
  title: string
  warnings: string[]
  wordCount: number
}
export type BilingualPostImportPreview = Record<ContentLocale, LocalizedPostImportPreview> & {
  warnings: string[]
}

function countMatches(source: string, expression: RegExp): number {
  return source.match(expression)?.length ?? 0
}

function assertRequired(value: string | undefined, field: string): string {
  if (!value?.trim()) throw new MarkdownImportError('MISSING_REQUIRED_METADATA', { cause: field })
  return value
}

function preview(file: MarkdownImportFile, payload: Payload): LocalizedPostImportPreview {
  const parsed = parseZiBlogMarkdown(file.source)
  const title = assertRequired(parsed.title, 'TITLE')
  const slug = normalizeSlug(assertRequired(parsed.slug, 'SLUG'), file.locale)
  const excerpt = assertRequired(parsed.excerpt, 'EXCERPT')
  let lexicalContent: unknown
  try {
    lexicalContent = convertMarkdownToPostLexical(parsed.content, payload.config)
  } catch (error) {
    throw new MarkdownImportError('LEXICAL_CONVERSION_FAILED', { cause: error })
  }
  const words = parsed.content.trim().split(/\s+/u).filter(Boolean)
  return {
    codeBlockCount: countMatches(parsed.content, /^ {0,3}(`{3,}|~{3,})/gm),
    excerpt,
    headingCount: countMatches(parsed.content, /^ {0,3}#{2,6}[ \t]+/gm),
    lexicalContent,
    locale: file.locale,
    readingTimeMinutes: calculateReadingTime(lexicalContent),
    seoDescription: parsed.seoDescription,
    seoTitle: parsed.seoTitle,
    slug,
    title,
    warnings: [],
    wordCount: words.length,
  }
}

export class BilingualPostImportService {
  constructor(private readonly payload: Payload) {}

  async validate(input: { english: MarkdownImportFile; vietnamese: MarkdownImportFile }): Promise<BilingualPostImportPreview> {
    const previews = [input.vietnamese, input.english].map((file) => preview(file, this.payload))
    for (const item of previews) {
      const existing = await this.payload.find({
        collection: 'posts', depth: 0, fallbackLocale: false, limit: 1, locale: item.locale,
        overrideAccess: true, pagination: false, where: { slug: { equals: item.slug } },
      })
      if (existing.docs.length) throw new MarkdownImportError('DUPLICATE_LOCALIZED_SLUG')
    }
    return { vi: previews.find(({ locale }) => locale === 'vi')!, en: previews.find(({ locale }) => locale === 'en')!, warnings: [] }
  }

  async createDraft(input: { actor: Actor & User; english: MarkdownImportFile; vietnamese: MarkdownImportFile }) {
    if (!isActiveStaff(input.actor)) throw new MarkdownImportError('UNAUTHORIZED_IMPORT')
    const result = await this.validate(input)
    const req = await createLocalReq({ context: { skipRevalidation: true }, user: input.actor }, this.payload)
    const ownsTransaction = await initTransaction(req)
    try {
      const vi = result.vi
      const created = await this.payload.create({
        collection: 'posts', draft: true, fallbackLocale: false, locale: 'vi', req,
        data: { _status: 'draft', content: vi.lexicalContent as never, excerpt: vi.excerpt, seo: { metaDescription: vi.seoDescription, metaTitle: vi.seoTitle }, slug: vi.slug, title: vi.title, visibility: 'public' },
      })
      const en = result.en
      await this.payload.update({
        collection: 'posts', draft: true, fallbackLocale: false, id: created.id, locale: 'en', req,
        data: { content: en.lexicalContent as never, excerpt: en.excerpt, seo: { metaDescription: en.seoDescription, metaTitle: en.seoTitle }, slug: en.slug, title: en.title },
      })
      if (ownsTransaction) await commitTransaction(req)
      return { postId: created.id, preview: result, status: 'draft' as const }
    } catch (error) {
      if (ownsTransaction && req.transactionID) await this.payload.db.rollbackTransaction(req.transactionID)
      throw error
    }
  }
}
