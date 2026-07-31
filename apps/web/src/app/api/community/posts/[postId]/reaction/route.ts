import { NextResponse } from 'next/server'

import { getReactionCounts, isReactionType, recordReaction } from '@/modules/community'
import { getPublicCommunityFeatures } from '@/modules/platform/community'
import { getPayloadClient } from '@/shared/payload/client'

type RouteContext = { params: Promise<{ postId: string }> }
const FEATURE_DISABLED_RESPONSE = { error: 'feature_disabled' }
const INVALID_REACTION_RESPONSE = { error: 'invalid_reaction' }

async function isPublicPost(postId: string): Promise<boolean> {
  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: 'posts',
    depth: 0,
    draft: false,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { id: { equals: postId } },
        { _status: { equals: 'published' } },
        { visibility: { equals: 'public' } },
      ],
    },
  })
  return found.docs.length === 1
}

export async function GET(_: Request, context: RouteContext): Promise<NextResponse> {
  const features = await getPublicCommunityFeatures()
  if (!features.postReactions) return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 403 })
  const { postId } = await context.params
  if (!(await isPublicPost(postId)))
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ reaction: null, counts: await getReactionCounts(postId) })
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
  const features = await getPublicCommunityFeatures()
  if (!features.postReactions) return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 403 })
  const { postId } = await context.params
  if (!(await isPublicPost(postId)))
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const body: unknown = await request.json().catch(() => null)
  const reactionType =
    body && typeof body === 'object' && 'reactionType' in body ? body.reactionType : null
  if (!isReactionType(reactionType))
    return NextResponse.json(INVALID_REACTION_RESPONSE, { status: 400 })
  return NextResponse.json({
    reaction: null,
    counts: await recordReaction({ postId, reactionType }),
  })
}

export async function DELETE(_: Request, context: RouteContext): Promise<NextResponse> {
  const features = await getPublicCommunityFeatures()
  if (!features.postReactions) return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 403 })
  const { postId } = await context.params
  if (!(await isPublicPost(postId)))
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ reaction: null, counts: await getReactionCounts(postId) })
}
