import { describe, expect, it } from 'vitest'

import { isReactionType } from '@/modules/community'
import { isAnalyticsEventType, isShareChannel, viewDeduplicationKey } from '@/modules/analytics'
import { projectPublicCommunityFeatures } from '@/modules/platform/community'

describe('community and analytics contracts', () => {
  it('allow-lists supported aggregate reactions', () => {
    expect(isReactionType('like')).toBe(true)
    expect(isReactionType('unsupported')).toBe(false)
  })

  it('allow-lists analytics event types and share channels', () => {
    expect(isAnalyticsEventType('article_view')).toBe(true)
    expect(isAnalyticsEventType('search')).toBe(false)
    expect(isShareChannel('copy_link')).toBe(true)
    expect(isShareChannel('unknown')).toBe(false)
    expect(viewDeduplicationKey('post', 'session-hash', '2026-07-30')).toBe(
      viewDeduplicationKey('post', 'session-hash', '2026-07-30'),
    )
  })

  it('projects only safe feature booleans with phase defaults', () => {
    expect(projectPublicCommunityFeatures({ commentsEnabled: true })).toEqual({
      anonymousProfiles: true,
      articleViewTracking: true,
      comments: true,
      postReactions: true,
      shareTracking: true,
    })
  })
})
