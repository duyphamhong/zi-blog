import { localePath, type ContentLocale } from '../i18n'

export const publicPaths = {
  home: (locale: ContentLocale) => localePath(locale),
  posts: (locale: ContentLocale) => localePath(locale, '/posts'),
  post: (locale: ContentLocale, slug: string) => localePath(locale, `/posts/${slug}`),
  category: (locale: ContentLocale, slug: string) => localePath(locale, `/categories/${slug}`),
  tag: (locale: ContentLocale, slug: string) => localePath(locale, `/tags/${slug}`),
  author: (locale: ContentLocale, username: string) => localePath(locale, `/authors/${username}`),
  series: (locale: ContentLocale, slug: string) => localePath(locale, `/series/${slug}`),
  sitemap: '/sitemap.xml',
  rss: (locale: ContentLocale) => localePath(locale, '/rss.xml'),
} as const
