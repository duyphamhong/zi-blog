import { getPayloadClient } from '@/shared/payload/client'

import { ANALYTICS_EVENTS_COLLECTION, ANALYTICS_PROCESSING_PENDING, ANALYTICS_PROCESSING_PROCESSED, POST_STATISTICS_COLLECTION } from './constants'

export type PublicPostStatistics = { totalViews: number; uniqueViews: number; likes: number; dislikes: number; shares: number }
const EMPTY_STATISTICS: PublicPostStatistics = { totalViews: 0, uniqueViews: 0, likes: 0, dislikes: 0, shares: 0 }

export async function getPublicPostStatistics(postId: string | number): Promise<PublicPostStatistics> {
  const payload = await getPayloadClient()
  const result = await payload.find({ collection: POST_STATISTICS_COLLECTION, depth: 0, limit: 1, overrideAccess: true, pagination: false, where: { postId: { equals: String(postId) } } })
  const statistic = result.docs[0]
  return statistic ? { totalViews: statistic.totalViews ?? 0, uniqueViews: statistic.uniqueViews ?? 0, likes: statistic.likes ?? 0, dislikes: statistic.dislikes ?? 0, shares: statistic.shares ?? 0 } : EMPTY_STATISTICS
}

export async function aggregateAnalyticsBatch(): Promise<number> {
  const payload = await getPayloadClient()
  const events = await payload.find({ collection: ANALYTICS_EVENTS_COLLECTION, depth: 0, limit: 100, overrideAccess: true, pagination: false, where: { processingStatus: { equals: ANALYTICS_PROCESSING_PENDING } } })
  for (const event of events.docs) {
    const found = await payload.find({ collection: POST_STATISTICS_COLLECTION, depth: 0, limit: 1, overrideAccess: true, pagination: false, where: { postId: { equals: event.postId } } })
    const current = found.docs[0]
    const incrementView = event.eventType === 'article_view' ? 1 : 0
    const incrementShare = event.eventType === 'share' ? 1 : 0
    const data = { postId: event.postId, totalViews: (current?.totalViews ?? 0) + incrementView, uniqueViews: (current?.uniqueViews ?? 0) + incrementView, shares: (current?.shares ?? 0) + incrementShare, likes: current?.likes ?? 0, dislikes: current?.dislikes ?? 0 }
    if (current) await payload.update({ collection: POST_STATISTICS_COLLECTION, id: current.id, data, overrideAccess: true })
    else await payload.create({ collection: POST_STATISTICS_COLLECTION, data, overrideAccess: true })
    await payload.update({ collection: ANALYTICS_EVENTS_COLLECTION, id: event.id, data: { processingStatus: ANALYTICS_PROCESSING_PROCESSED }, overrideAccess: true })
  }
  return events.docs.length
}
