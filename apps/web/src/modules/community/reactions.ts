import { getPayloadClient } from '@/shared/payload/client'

import { POST_STATISTICS_COLLECTION } from '@/modules/analytics'

import { REACTION_TYPES } from './constants'

export type ReactionType = (typeof REACTION_TYPES)[number]
export type ReactionCounts = { likes: number; dislikes: number }

export function isReactionType(value: unknown): value is ReactionType {
  return typeof value === 'string' && (REACTION_TYPES as readonly string[]).includes(value)
}

export async function getReactionCounts(postId: number | string): Promise<ReactionCounts> {
  const payload = await getPayloadClient()
  const statistics = await payload.find({
    collection: POST_STATISTICS_COLLECTION,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { postId: { equals: String(postId) } },
  })
  const current = statistics.docs[0]
  return { dislikes: current?.dislikes ?? 0, likes: current?.likes ?? 0 }
}

/** Records an aggregate only. Browser reactions deliberately have no persisted identity or toggle state. */
export async function recordReaction(input: {
  postId: number | string
  reactionType: ReactionType
}): Promise<ReactionCounts> {
  const payload = await getPayloadClient()
  const statistics = await payload.find({
    collection: POST_STATISTICS_COLLECTION,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { postId: { equals: String(input.postId) } },
  })
  const current = statistics.docs[0]
  const counts = {
    dislikes: (current?.dislikes ?? 0) + (input.reactionType === 'dislike' ? 1 : 0),
    likes: (current?.likes ?? 0) + (input.reactionType === 'like' ? 1 : 0),
  }
  const data = {
    ...counts,
    postId: String(input.postId),
    shares: current?.shares ?? 0,
    totalViews: current?.totalViews ?? 0,
    uniqueViews: current?.uniqueViews ?? 0,
  }
  if (current) {
    await payload.update({
      collection: POST_STATISTICS_COLLECTION,
      data,
      id: current.id,
      overrideAccess: true,
    })
  } else {
    await payload.create({ collection: POST_STATISTICS_COLLECTION, data, overrideAccess: true })
  }
  return counts
}
