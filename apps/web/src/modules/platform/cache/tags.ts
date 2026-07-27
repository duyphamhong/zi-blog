import type { ContentLocale } from '../i18n'

export const cacheTags = {
  categories: 'categories',
  navigation: 'navigation',
  posts: 'posts',
  series: 'series',
  settings: 'site-settings',
  tags: 'tags',
  users: 'public-authors',
  locale: {
    category: (locale: ContentLocale, id: number | string) => `category:${id}:${locale}`,
    feed: (locale: ContentLocale) => `post-feed:${locale}`,
    navigation: (locale: ContentLocale) => `navigation:${locale}`,
    post: (locale: ContentLocale, id: number | string) => `post:${id}:${locale}`,
    postSlug: (locale: ContentLocale, slug: string) => `post-slug:${locale}:${slug}`,
    search: (locale: ContentLocale) => `search:${locale}`,
    settings: (locale: ContentLocale) => `site-settings:${locale}`,
  },
} as const
