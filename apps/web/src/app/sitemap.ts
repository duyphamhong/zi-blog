import type { MetadataRoute } from 'next'

import { getPublishedPostsForSitemap } from '@/modules/content'
import { getPublicSiteSettings } from '@/modules/platform'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, posts] = await Promise.all([
    getPublicSiteSettings(),
    getPublishedPostsForSitemap(),
  ])
  const urls = new Map<string, MetadataRoute.Sitemap[number]>()
  const add = (path: string, lastModified?: string) => {
    urls.set(path, {
      lastModified,
      url: new URL(path, settings.siteUrl).toString(),
    })
  }

  add('/')
  for (const post of posts) {
    add(`/posts/${post.slug}`, post.publishedAt)
    add(`/categories/${post.category.slug}`)
    add(`/authors/${post.author.username}`)
    post.tags.forEach((tag) => add(`/tags/${tag.slug}`))
    if (post.series) add(`/series/${post.series.slug}`)
  }
  return [...urls.values()]
}
