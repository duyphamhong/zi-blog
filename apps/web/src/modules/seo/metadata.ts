import type { Metadata } from 'next'

import type { PostDetail } from '@/modules/content'
import type { PublicSiteSettings } from '@/modules/platform'

export function buildPostMetadata(post: PostDetail, settings: PublicSiteSettings): Metadata {
  const canonical = post.seo?.canonicalUrl || `${settings.siteUrl}/posts/${post.slug}`
  const title = post.seo?.metaTitle || `${post.title} | ${settings.siteName}`
  const description = post.seo?.metaDescription || post.excerpt
  const image = post.coverImage?.url

  return {
    alternates: { canonical },
    description,
    openGraph: {
      authors: [post.author.displayName],
      description,
      images: image ? [{ alt: post.coverImage?.alt, url: image }] : undefined,
      publishedTime: post.publishedAt,
      title,
      type: 'article',
      url: canonical,
    },
    robots:
      post.seo?.noIndex || post.visibility === 'unlisted'
        ? { follow: false, index: false }
        : undefined,
    title,
  }
}
