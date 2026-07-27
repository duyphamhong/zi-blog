import { describe, expect, it } from 'vitest'

import {
  calculateReadingTime,
  isDirectlyAccessiblePost,
  isIndexablePost,
  isPublicFeedPost,
  normalizeSlug,
} from '@/modules/content/validation'
import { canPublish, isActiveStaff } from '@/modules/identity'

describe('content rules', () => {
  it('normalizes slugs deterministically', () => {
    expect(normalizeSlug('  Payload CMS — Déjà Vu!  ')).toBe('payload-cms-deja-vu')
    expect(normalizeSlug('repeat---separators')).toBe('repeat-separators')
  })

  it('calculates reading time from Lexical text', () => {
    const words = Array.from({ length: 221 }, (_, index) => `word${index}`).join(' ')
    const content = { root: { children: [{ children: [{ text: words }] }] } }
    expect(calculateReadingTime(content)).toBe(2)
    expect(calculateReadingTime(null)).toBe(1)
  })

  it('keeps feed, direct, and index visibility distinct', () => {
    expect(isPublicFeedPost({ _status: 'published', visibility: 'public' })).toBe(true)
    expect(isPublicFeedPost({ _status: 'draft', visibility: 'public' })).toBe(false)
    expect(isDirectlyAccessiblePost({ _status: 'published', visibility: 'unlisted' })).toBe(true)
    expect(isIndexablePost({ _status: 'published', visibility: 'unlisted' })).toBe(false)
    expect(
      isIndexablePost({
        _status: 'published',
        seo: { noIndex: true },
        visibility: 'public',
      }),
    ).toBe(false)
  })

  it('enforces role capabilities and disabled staff status', () => {
    expect(canPublish({ id: 1, role: 'editor', status: 'active' })).toBe(true)
    expect(canPublish({ id: 2, role: 'author', status: 'active' })).toBe(false)
    expect(isActiveStaff({ id: 3, role: 'super_admin', status: 'disabled' })).toBe(false)
  })
})
