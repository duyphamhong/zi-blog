import type { Metadata } from 'next'

import type { PostDetail } from '@/modules/content'
import type { PublicSiteSettings } from '@/modules/platform'
import { LOCALE_METADATA, localizedPostPath, type ContentLocale } from '@/modules/platform'
import type { LocalizedUrls } from '@/modules/content'

export function buildPostMetadata(input: {
  alternateUrls: LocalizedUrls
  locale: ContentLocale
  post: PostDetail
  settings: PublicSiteSettings
}): Metadata {
  const { alternateUrls, locale, post, settings } = input
  const canonical =
    post.seo?.canonicalUrl ||
    new URL(localizedPostPath(locale, post.slug), settings.siteUrl).toString()
  const title = post.seo?.metaTitle || `${post.title} | ${settings.siteName}`
  const description = post.seo?.metaDescription || post.excerpt
  const image = post.coverImage?.url

  return {
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          Object.entries(alternateUrls).map(([code, path]) => [
            code,
            new URL(path, settings.siteUrl).toString(),
          ]),
        ),
        ...(alternateUrls.vi
          ? { 'x-default': new URL(alternateUrls.vi, settings.siteUrl).toString() }
          : {}),
      },
    },
    description,
    openGraph: {
      authors: [post.author.displayName],
      description,
      images: image ? [{ alt: post.coverImage?.alt, url: image }] : undefined,
      locale: LOCALE_METADATA[locale].openGraphLocale,
      alternateLocale: Object.keys(alternateUrls)
        .filter((code) => code !== locale)
        .map((code) => LOCALE_METADATA[code as ContentLocale].openGraphLocale),
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
