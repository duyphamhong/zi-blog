import { NextResponse } from 'next/server'

import { isAnalyticsEventType, isShareChannel, recordAnalyticsEvent } from '@/modules/analytics'
import { resolveAnonymousActor } from '@/modules/identity/anonymous'
import { getPublicCommunityFeatures } from '@/modules/platform/community'
import { getPayloadClient } from '@/shared/payload/client'

const INVALID_EVENT_RESPONSE = { error: 'invalid_event' }

export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || !('eventType' in body) || !isAnalyticsEventType(body.eventType) || !('postId' in body) || typeof body.postId !== 'string' || !('sessionId' in body) || typeof body.sessionId !== 'string' || body.sessionId.length > 200) return NextResponse.json(INVALID_EVENT_RESPONSE, { status: 400 })
  const channel = 'metadata' in body && body.metadata && typeof body.metadata === 'object' && 'channel' in body.metadata ? body.metadata.channel : undefined
  const shareChannel = isShareChannel(channel) ? channel : undefined
  if (body.eventType === 'share' && !shareChannel) return NextResponse.json(INVALID_EVENT_RESPONSE, { status: 400 })
  const features = await getPublicCommunityFeatures()
  if ((body.eventType === 'article_view' && !features.articleViewTracking) || (body.eventType === 'share' && !features.shareTracking)) return NextResponse.json({ error: 'feature_disabled' }, { status: 403 })
  const payload = await getPayloadClient()
  const post = await payload.find({ collection: 'posts', depth: 0, draft: false, limit: 1, overrideAccess: true, pagination: false, where: { and: [{ id: { equals: body.postId } }, { _status: { equals: 'published' } }, { visibility: { equals: 'public' } }] } })
  if (post.docs.length !== 1) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const actor = await resolveAnonymousActor()
  if (actor.status === 'blocked') return NextResponse.json({ error: 'anonymous_profile_blocked' }, { status: 403 })
  await recordAnalyticsEvent({ channel: shareChannel, eventType: body.eventType, postId: body.postId, profileId: actor.profileId, sessionId: body.sessionId })
  return NextResponse.json({ accepted: true }, { status: 202 })
}
