import { describe, expect, it } from 'vitest'

import type { PostDetail } from '@/modules/content'
import { buildPostMetadata } from '@/modules/seo'

const post = {
  id: 1,
  author: {
    displayName: 'Test Author',
    expertise: [],
    username: 'test-author',
  },
  category: { name: 'Architecture', slug: 'architecture' },
  content: {
    root: {
      children: [],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  },
  excerpt: 'A sufficiently descriptive public excerpt for the article metadata.',
  featured: false,
  publishedAt: '2026-07-28T00:00:00.000Z',
  readingTimeMinutes: 3,
  slug: 'metadata-fallbacks',
  tags: [],
  title: 'Metadata Fallbacks',
  visibility: 'public',
} as PostDetail

const settings = {
  defaultSeoDescription: 'Default description',
  defaultSeoTitle: 'Default title',
  enableDarkMode: true,
  postsPerPage: 10,
  siteDescription: 'Site description',
  siteName: 'Zi-Blog',
  siteUrl: 'https://example.com',
}

describe('SEO metadata', () => {
  it('uses post and site fallbacks', () => {
    const metadata = buildPostMetadata({
      alternateUrls: { en: '/en/posts/metadata-fallbacks' },
      locale: 'en',
      post,
      settings,
    })
    expect(metadata.title).toBe('Metadata Fallbacks | Zi-Blog')
    expect(metadata.description).toBe(post.excerpt)
    expect(metadata.alternates?.canonical).toBe('https://example.com/en/posts/metadata-fallbacks')
  })

  it('forces unlisted posts to noindex', () => {
    const metadata = buildPostMetadata({
      alternateUrls: { en: '/en/posts/metadata-fallbacks' },
      locale: 'en',
      post: { ...post, visibility: 'unlisted' },
      settings,
    })
    expect(metadata.robots).toEqual({ follow: false, index: false })
  })
})
