import type {
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
  Payload,
  PayloadRequest,
} from 'payload'

import {
  extractRichTextPlainText,
  inspectTranslation,
  normalizeSearchText,
} from '@/modules/content/validation'
import { CONTENT_LOCALES, type ContentLocale } from '@/modules/platform'
import type { Post, SearchDocument } from '@/payload-types'

export { normalizeSearchText } from '@/modules/content/validation'

function postLocaleKey(postId: number | string, locale: ContentLocale): string {
  return `${postId}:${locale}`
}

async function deleteSearchDocument(
  payload: Payload,
  postId: number | string,
  locale?: ContentLocale,
  req?: PayloadRequest,
): Promise<void> {
  await payload.delete({
    collection: 'search-documents',
    overrideAccess: true,
    req,
    where: locale
      ? { postLocaleKey: { equals: postLocaleKey(postId, locale) } }
      : { post: { equals: postId } },
  })
}

export async function synchronizePostSearchDocuments(
  payload: Payload,
  postId: number | string,
  requestedLocale?: ContentLocale,
  req?: PayloadRequest,
): Promise<void> {
  const locales = requestedLocale ? [requestedLocale] : CONTENT_LOCALES

  for (const locale of locales) {
    const post = await payload.findByID({
      collection: 'posts',
      depth: 0,
      draft: false,
      fallbackLocale: false,
      id: postId,
      locale,
      overrideAccess: true,
      req,
    })
    const readiness = inspectTranslation(post)
    if (post._status !== 'published' || post.visibility !== 'public' || !readiness.complete) {
      await deleteSearchDocument(payload, postId, locale, req)
      continue
    }
    const plainTextContent = extractRichTextPlainText(post.content)
    const normalizedSearchText = normalizeSearchText(
      [post.title, post.excerpt, plainTextContent].join(' '),
      locale,
    )
    const key = postLocaleKey(postId, locale)
    const existing = await payload.find({
      collection: 'search-documents',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { postLocaleKey: { equals: key } },
      req,
    })
    const data = {
      excerpt: post.excerpt,
      locale,
      normalizedSearchText,
      plainTextContent,
      post: post.id,
      postLocaleKey: key,
      publishedAt: post.publishedAt as string,
      slug: post.slug,
      title: post.title,
    }
    if (existing.docs[0]) {
      await payload.update({
        collection: 'search-documents',
        data,
        id: existing.docs[0].id,
        overrideAccess: true,
        req,
      })
    } else {
      await payload.create({
        collection: 'search-documents',
        data,
        overrideAccess: true,
        req,
      })
    }
  }
}

export const synchronizePostSearchAfterChange: CollectionAfterChangeHook<Post> = async ({
  doc,
  req,
}) => {
  // Shared fields (status, visibility, publication date) affect every locale, so
  // each write rebuilds both small locale-specific search projections.
  await synchronizePostSearchDocuments(req.payload, doc.id, undefined, req)
  return doc
}

export const removePostSearchBeforeDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await deleteSearchDocument(req.payload, id, undefined, req)
}

export async function searchLocalizedDocuments(input: {
  limit: number
  locale: ContentLocale
  page: number
  payload: Payload
  query: string
}): Promise<{ docs: SearchDocument[]; totalPages: number }> {
  const normalized = normalizeSearchText(input.query, input.locale)
  if (normalized.length < 2 || normalized.length > 100) return { docs: [], totalPages: 0 }
  const result = await input.payload.find({
    collection: 'search-documents',
    depth: 0,
    limit: input.limit,
    overrideAccess: true,
    page: input.page,
    pagination: true,
    sort: '-publishedAt',
    where: {
      and: [
        { locale: { equals: input.locale } },
        { normalizedSearchText: { contains: normalized } },
      ],
    },
  })
  return { docs: result.docs, totalPages: result.totalPages }
}
