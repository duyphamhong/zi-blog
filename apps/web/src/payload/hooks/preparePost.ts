import type { CollectionBeforeChangeHook } from 'payload'

import { calculateReadingTime } from '@/modules/content/validation'
import { getActor } from '@/modules/identity'

function isSeedRequest(context: unknown): boolean {
  return Boolean(context && typeof context === 'object' && 'seed' in context && context.seed)
}

export const preparePost: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  const actor = getActor(req.user)
  const seedRequest = isSeedRequest(req.context)
  const nextStatus = data._status ?? originalDoc?._status ?? 'draft'

  if (!seedRequest && actor?.role === 'author') {
    if (nextStatus === 'published') {
      throw new Error('Authors cannot publish posts in Phase 1')
    }
    if (operation === 'create') data.author = actor.id
  }

  const content = data.content ?? originalDoc?.content
  data.readingTimeMinutes = calculateReadingTime(content)

  const series = data.series !== undefined ? data.series : originalDoc?.series
  const seriesOrder = data.seriesOrder !== undefined ? data.seriesOrder : originalDoc?.seriesOrder
  if (series && (typeof seriesOrder !== 'number' || seriesOrder < 1)) {
    throw new Error('seriesOrder is required and must be positive when a series is selected')
  }
  if (!series) data.seriesOrder = null

  if (nextStatus === 'published' && !data.publishedAt && !originalDoc?.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }

  return data
}
