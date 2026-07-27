import type { ContentLocale } from './config'

export function localePath(locale: ContentLocale, path = '/'): string {
  const normalized = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return `/${locale}${normalized}`
}

export function localizedPostPath(locale: ContentLocale, slug: string): string {
  return localePath(locale, `/posts/${slug}`)
}
