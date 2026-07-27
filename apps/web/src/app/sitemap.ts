import type { MetadataRoute } from 'next'

import { getAlternatePostUrls, getPublishedPostsForSitemap } from '@/modules/content'
import { CONTENT_LOCALES, getPublicSiteSettings, localePath } from '@/modules/platform'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, localizedPosts] = await Promise.all([
    getPublicSiteSettings('vi'),
    Promise.all(
      CONTENT_LOCALES.map(async (locale) => ({
        locale,
        posts: await getPublishedPostsForSitemap(locale),
      })),
    ),
  ])
  const urls = new Map<string, MetadataRoute.Sitemap[number]>()
  const add = (path: string, lastModified?: string) => {
    urls.set(path, {
      lastModified,
      url: new URL(path, settings.siteUrl).toString(),
    })
  }

  CONTENT_LOCALES.forEach((locale) => add(localePath(locale)))
  for (const { locale, posts } of localizedPosts) {
    for (const post of posts) {
      const path = localePath(locale, `/posts/${post.slug}`)
      const alternatePaths = await getAlternatePostUrls(post.id)
      urls.set(path, {
        alternates: {
          languages: Object.fromEntries(
            Object.entries(alternatePaths).map(([code, alternatePath]) => [
              code,
              new URL(alternatePath, settings.siteUrl).toString(),
            ]),
          ),
        },
        lastModified: post.publishedAt,
        url: new URL(path, settings.siteUrl).toString(),
      })
      add(localePath(locale, `/categories/${post.category.slug}`))
      add(localePath(locale, `/authors/${post.author.username}`))
      post.tags.forEach((tag) => add(localePath(locale, `/tags/${tag.slug}`)))
      if (post.series) add(localePath(locale, `/series/${post.series.slug}`))
    }
  }
  return [...urls.values()]
}
