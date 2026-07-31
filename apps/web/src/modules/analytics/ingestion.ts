import { createHash } from 'node:crypto'

import { getPayloadClient } from '@/shared/payload/client'

import {
  ANALYTICS_EVENTS_COLLECTION,
  ANALYTICS_EVENT_TYPES,
  ANALYTICS_PROCESSING_PENDING,
  SHARE_CHANNELS,
} from './constants'

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number]
export type ShareChannel = (typeof SHARE_CHANNELS)[number]

export function isAnalyticsEventType(value: unknown): value is AnalyticsEventType {
  return typeof value === 'string' && (ANALYTICS_EVENT_TYPES as readonly string[]).includes(value)
}
export function isShareChannel(value: unknown): value is ShareChannel {
  return typeof value === 'string' && (SHARE_CHANNELS as readonly string[]).includes(value)
}
export function sessionHash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}
export function viewDeduplicationKey(postId: string, hashedSessionId: string, day: string): string {
  return createHash('sha256').update(`${postId}:${hashedSessionId}:${day}`).digest('hex')
}

export async function recordAnalyticsEvent(input: {
  eventType: AnalyticsEventType
  postId: string
  sessionId: string
  channel?: ShareChannel
}): Promise<void> {
  const payload = await getPayloadClient()
  const now = new Date()
  const day = now.toISOString().slice(0, 10)
  const hashedSessionId = sessionHash(input.sessionId)
  const deduplicationKey =
    input.eventType === 'article_view'
      ? viewDeduplicationKey(input.postId, hashedSessionId, day)
      : undefined
  if (deduplicationKey) {
    const existing = await payload.find({
      collection: ANALYTICS_EVENTS_COLLECTION,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { deduplicationKey: { equals: deduplicationKey } },
    })
    if (existing.docs.length > 0) return
  }
  await payload.create({
    collection: ANALYTICS_EVENTS_COLLECTION,
    data: {
      eventType: input.eventType,
      postId: input.postId,
      sessionIdHash: hashedSessionId,
      deduplicationKey,
      metadataChannel: input.channel,
      occurredAt: now.toISOString(),
      processingStatus: ANALYTICS_PROCESSING_PENDING,
    },
    overrideAccess: true,
  })
}
