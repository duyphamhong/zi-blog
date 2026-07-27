import { describe, expect, it } from 'vitest'

import {
  inspectTranslation,
  normalizeSearchText,
  normalizeSlug,
} from '@/modules/content/validation'
import {
  cacheTags,
  detectContentLocale,
  formatDate,
  getDictionary,
  isContentLocale,
  localePath,
  LOCALE_METADATA,
} from '@/modules/platform'
import { lexicalDocument } from '@/payload/seed/content'

describe('bilingual locale contract', () => {
  it('validates supported locale codes and metadata', () => {
    expect(isContentLocale('vi')).toBe(true)
    expect(isContentLocale('en')).toBe(true)
    expect(isContentLocale('fr')).toBe(false)
    expect(LOCALE_METADATA.vi.intlLocale).toBe('vi-VN')
    expect(LOCALE_METADATA.en.openGraphLocale).toBe('en_US')
  })

  it('detects cookie, browser preference, and default locale in priority order', () => {
    expect(detectContentLocale({ acceptLanguage: 'vi-VN,vi;q=0.9', cookie: 'en' })).toBe('en')
    expect(detectContentLocale({ acceptLanguage: 'fr;q=0.9,en-US;q=0.8' })).toBe('en')
    expect(detectContentLocale({ acceptLanguage: 'fr-FR' })).toBe('vi')
  })

  it('keeps English and Vietnamese dictionaries in parity', async () => {
    const [english, vietnamese] = await Promise.all([getDictionary('en'), getDictionary('vi')])
    expect(Object.keys(vietnamese)).toEqual(Object.keys(english))
    for (const section of Object.keys(english) as Array<keyof typeof english>) {
      expect(Object.keys(vietnamese[section])).toEqual(Object.keys(english[section]))
    }
  })

  it('formats dates in the requested locale and editorial timezone', () => {
    const date = '2026-07-28T00:00:00.000Z'
    expect(formatDate(date, 'vi')).toContain('tháng 7')
    expect(formatDate(date, 'en')).toContain('July')
  })

  it('normalizes Vietnamese slugs and accent-insensitive search text', () => {
    expect(normalizeSlug('Đánh giá Payload CMS', 'vi')).toBe('danh-gia-payload-cms')
    expect(normalizeSlug('Payload CMS: A Review', 'en')).toBe('payload-cms-a-review')
    expect(normalizeSearchText('Kiến trúc Node.js, C# và C++', 'vi')).toBe(
      'kien truc node.js c# va c++',
    )
    expect(normalizeSearchText('Next.js Architecture', 'en')).toBe('next.js architecture')
  })

  it('builds locale-scoped public paths and cache tags', () => {
    expect(localePath('vi', '/posts/kien-truc')).toBe('/vi/posts/kien-truc')
    expect(cacheTags.locale.postSlug('en', 'architecture')).toBe('post-slug:en:architecture')
    expect(cacheTags.locale.feed('vi')).toBe('post-feed:vi')
  })

  it('reports translation completeness without accepting empty rich text', () => {
    expect(
      inspectTranslation({
        content: lexicalDocument(['Nội dung']),
        excerpt: 'Tóm tắt',
        slug: 'bai-viet',
        title: 'Bài viết',
      }),
    ).toEqual({ complete: true, missingFields: [] })
    expect(inspectTranslation({ excerpt: '', slug: 'draft', title: 'Draft' })).toEqual({
      complete: false,
      missingFields: ['excerpt', 'content'],
    })
  })
})
