import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { publicPaths } from '@/modules/platform/cache/paths'
import { cacheTags } from '@/modules/platform/cache/tags'
import { CONTENT_LOCALES, parseContentLocale, type ContentLocale } from '@/modules/platform'

type Document = Record<string, unknown>

function record(value: unknown): Document | null {
  return value && typeof value === 'object' ? (value as Document) : null
}

function relationId(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  const relation = record(value)
  const id = relation?.id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

async function relationValue(
  req: PayloadRequest,
  collection: 'categories' | 'series' | 'tags' | 'users',
  value: unknown,
  field: 'slug' | 'username',
  locale: ContentLocale,
): Promise<string | null> {
  const populated = record(value)
  const populatedValue = populated?.[field]
  if (typeof populatedValue === 'string') return populatedValue

  const id = relationId(value)
  if (!id) return null
  const related = await req.payload.findByID({
    collection,
    id,
    depth: 0,
    fallbackLocale: false,
    locale,
    overrideAccess: true,
    req,
  })
  const candidate = record(related)?.[field]
  return typeof candidate === 'string' ? candidate : null
}

async function collectPaths(
  doc: Document,
  req: PayloadRequest,
  locale: ContentLocale,
): Promise<Set<string>> {
  const paths = new Set<string>([
    publicPaths.home(locale),
    publicPaths.posts(locale),
    publicPaths.sitemap,
    publicPaths.rss(locale),
  ])

  if (typeof doc.slug === 'string') paths.add(publicPaths.post(locale, doc.slug))

  const category = await relationValue(req, 'categories', doc.category, 'slug', locale)
  if (category) paths.add(publicPaths.category(locale, category))

  const author = await relationValue(req, 'users', doc.author, 'username', locale)
  if (author) paths.add(publicPaths.author(locale, author))

  const series = await relationValue(req, 'series', doc.series, 'slug', locale)
  if (series) paths.add(publicPaths.series(locale, series))

  if (Array.isArray(doc.tags)) {
    const tags = await Promise.all(
      doc.tags.map((tag) => relationValue(req, 'tags', tag, 'slug', locale)),
    )
    tags
      .filter((tag): tag is string => Boolean(tag))
      .forEach((tag) => {
        paths.add(publicPaths.tag(locale, tag))
      })
  }

  return paths
}

function shouldSkip(req: PayloadRequest): boolean {
  if (req.pathname?.startsWith('/admin/')) return true

  const { context } = req
  return Boolean(
    context &&
      typeof context === 'object' &&
      'skipRevalidation' in context &&
      context.skipRevalidation,
  )
}

export const revalidatePostAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (shouldSkip(req)) return doc
  const requestLocale = parseContentLocale(req.locale)
  const paths = new Set<string>()
  for (const locale of CONTENT_LOCALES) {
    let localizedDoc = record(doc) ?? {}
    if (doc.id && locale !== requestLocale) {
      localizedDoc =
        record(
          await req.payload.findByID({
            collection: 'posts',
            depth: 0,
            draft: true,
            fallbackLocale: false,
            id: doc.id,
            locale,
            overrideAccess: true,
            req,
          }),
        ) ?? {}
    }
    const current = await collectPaths(localizedDoc, req, locale)
    const previous =
      locale === requestLocale
        ? await collectPaths(record(previousDoc) ?? {}, req, locale)
        : new Set<string>()
    ;[...current, ...previous].forEach((path) => paths.add(path))
    revalidateTag(cacheTags.locale.feed(locale), 'max')
    revalidateTag(cacheTags.locale.search(locale), 'max')
    revalidateTag(cacheTags.locale.post(locale, doc.id), 'max')
  }
  for (const path of paths) revalidatePath(path)
  revalidateTag(cacheTags.posts, 'max')
  revalidateTag(cacheTags.categories, 'max')
  revalidateTag(cacheTags.tags, 'max')
  revalidateTag(cacheTags.series, 'max')
  revalidateTag(cacheTags.users, 'max')
  return doc
}

export const revalidatePostAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (shouldSkip(req)) return doc
  for (const locale of CONTENT_LOCALES) {
    const paths = await collectPaths(record(doc) ?? {}, req, locale)
    for (const path of paths) revalidatePath(path)
    revalidateTag(cacheTags.locale.feed(locale), 'max')
    revalidateTag(cacheTags.locale.search(locale), 'max')
  }
  revalidateTag(cacheTags.posts, 'max')
  return doc
}
