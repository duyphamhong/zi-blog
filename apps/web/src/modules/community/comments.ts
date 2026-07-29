import { getPayloadClient } from '@/shared/payload/client'

import { COMMENTS_COLLECTION } from './constants'

export function normalizeCommentContent(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 0 && normalized.length <= maxLength ? normalized : null
}

export async function getPublishedComments(postId: number | string) {
  const payload = await getPayloadClient()
  return payload.find({ collection: COMMENTS_COLLECTION, depth: 0, limit: 100, overrideAccess: true, pagination: false, sort: 'createdAt', where: { and: [{ post: { equals: postId } }, { status: { equals: 'published' } }] } })
}
