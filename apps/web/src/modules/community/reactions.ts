import { createHash } from 'node:crypto'

import { getPayloadClient } from '@/shared/payload/client'

import { REACTIONS_COLLECTION, REACTION_TARGET_TYPE_POST, REACTION_TYPES } from './constants'

export type ReactionType = (typeof REACTION_TYPES)[number]
export type ReactionCounts = { likes: number; dislikes: number }

export function isReactionType(value: unknown): value is ReactionType {
  return typeof value === 'string' && (REACTION_TYPES as readonly string[]).includes(value)
}

export function reactionUniquenessKey(profileId: number, postId: number | string): string {
  return createHash('sha256')
    .update(`anonymous:${profileId}:${REACTION_TARGET_TYPE_POST}:${postId}`)
    .digest('hex')
}

export async function getReactionCounts(postId: number | string): Promise<ReactionCounts> {
  const payload = await getPayloadClient()
  const [likes, dislikes] = await Promise.all(
    REACTION_TYPES.map((reactionType) =>
      payload.count({
        collection: REACTIONS_COLLECTION,
        overrideAccess: true,
        where: {
          and: [
            { targetId: { equals: String(postId) } },
            { reactionType: { equals: reactionType } },
          ],
        },
      }),
    ),
  )
  return { likes: likes.totalDocs, dislikes: dislikes.totalDocs }
}

async function synchronizeReactionStatistics(postId: number | string): Promise<ReactionCounts> {
  const payload = await getPayloadClient()
  const counts = await getReactionCounts(postId)
  const statistics = await payload.find({
    collection: 'post-statistics',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { postId: { equals: String(postId) } },
  })
  const current = statistics.docs[0]
  const data = {
    dislikes: counts.dislikes,
    likes: counts.likes,
    postId: String(postId),
    shares: current?.shares ?? 0,
    totalViews: current?.totalViews ?? 0,
    uniqueViews: current?.uniqueViews ?? 0,
  }
  if (current)
    await payload.update({
      collection: 'post-statistics',
      id: current.id,
      data,
      overrideAccess: true,
    })
  else await payload.create({ collection: 'post-statistics', data, overrideAccess: true })
  return counts
}

export async function getReactionState(
  postId: number | string,
  profileId: number,
): Promise<ReactionType | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: REACTIONS_COLLECTION,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { uniquenessKey: { equals: reactionUniquenessKey(profileId, postId) } },
  })
  const value = result.docs[0]?.reactionType
  return isReactionType(value) ? value : null
}

export async function setReaction(input: {
  postId: number | string
  profileId: number
  reactionType: ReactionType
}): Promise<{ reaction: ReactionType | null; counts: ReactionCounts }> {
  const payload = await getPayloadClient()
  const key = reactionUniquenessKey(input.profileId, input.postId)
  const found = await payload.find({
    collection: REACTIONS_COLLECTION,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { uniquenessKey: { equals: key } },
  })
  const existing = found.docs[0]
  if (existing?.reactionType === input.reactionType)
    await payload.delete({
      collection: REACTIONS_COLLECTION,
      id: existing.id,
      overrideAccess: true,
    })
  else if (existing)
    await payload.update({
      collection: REACTIONS_COLLECTION,
      id: existing.id,
      data: { reactionType: input.reactionType },
      overrideAccess: true,
    })
  else
    await payload.create({
      collection: REACTIONS_COLLECTION,
      data: {
        actorType: 'anonymous',
        anonymousProfile: input.profileId,
        reactionType: input.reactionType,
        targetId: String(input.postId),
        targetType: REACTION_TARGET_TYPE_POST,
        uniquenessKey: key,
      },
      overrideAccess: true,
    })
  return {
    reaction: existing?.reactionType === input.reactionType ? null : input.reactionType,
    counts: await synchronizeReactionStatistics(input.postId),
  }
}

export async function removeReaction(
  postId: number | string,
  profileId: number,
): Promise<ReactionCounts> {
  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: REACTIONS_COLLECTION,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { uniquenessKey: { equals: reactionUniquenessKey(profileId, postId) } },
  })
  if (found.docs[0])
    await payload.delete({
      collection: REACTIONS_COLLECTION,
      id: found.docs[0].id,
      overrideAccess: true,
    })
  return synchronizeReactionStatistics(postId)
}
