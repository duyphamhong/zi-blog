import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { publicPaths } from '@/modules/platform/cache/paths'
import { cacheTags } from '@/modules/platform/cache/tags'

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
    overrideAccess: true,
    req,
  })
  const candidate = record(related)?.[field]
  return typeof candidate === 'string' ? candidate : null
}

async function collectPaths(doc: Document, req: PayloadRequest): Promise<Set<string>> {
  const paths = new Set<string>([
    publicPaths.home,
    publicPaths.posts,
    publicPaths.sitemap,
    publicPaths.rss,
  ])

  if (typeof doc.slug === 'string') paths.add(publicPaths.post(doc.slug))

  const category = await relationValue(req, 'categories', doc.category, 'slug')
  if (category) paths.add(publicPaths.category(category))

  const author = await relationValue(req, 'users', doc.author, 'username')
  if (author) paths.add(publicPaths.author(author))

  const series = await relationValue(req, 'series', doc.series, 'slug')
  if (series) paths.add(publicPaths.series(series))

  if (Array.isArray(doc.tags)) {
    const tags = await Promise.all(doc.tags.map((tag) => relationValue(req, 'tags', tag, 'slug')))
    tags
      .filter((tag): tag is string => Boolean(tag))
      .forEach((tag) => {
        paths.add(publicPaths.tag(tag))
      })
  }

  return paths
}

function shouldSkip(context: unknown): boolean {
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
  if (shouldSkip(req.context)) return doc
  const current = await collectPaths(record(doc) ?? {}, req)
  const previous = await collectPaths(record(previousDoc) ?? {}, req)

  for (const path of new Set([...current, ...previous])) revalidatePath(path)
  revalidateTag(cacheTags.posts, 'max')
  revalidateTag(cacheTags.categories, 'max')
  revalidateTag(cacheTags.tags, 'max')
  revalidateTag(cacheTags.series, 'max')
  revalidateTag(cacheTags.users, 'max')
  return doc
}

export const revalidatePostAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (shouldSkip(req.context)) return doc
  const paths = await collectPaths(record(doc) ?? {}, req)
  for (const path of paths) revalidatePath(path)
  revalidateTag(cacheTags.posts, 'max')
  return doc
}
