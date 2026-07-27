import { getPublishedPostsForRss } from '@/modules/content'
import { getPublicSiteSettings, localePath, type ContentLocale } from '@/modules/platform'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function buildLocalizedRss(locale: ContentLocale): Promise<Response> {
  const [settings, posts] = await Promise.all([
    getPublicSiteSettings(locale),
    getPublishedPostsForRss(locale),
  ])
  const items = posts
    .map((post) => {
      const url = new URL(localePath(locale, `/posts/${post.slug}`), settings.siteUrl).toString()
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid>${escapeXml(url)}</guid>
  <description>${escapeXml(post.excerpt)}</description>
  <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
  <author>${escapeXml(post.author.displayName)}</author>
  <category>${escapeXml(post.category.name)}</category>
</item>`
    })
    .join('\n')
  const homeUrl = new URL(localePath(locale), settings.siteUrl).toString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(settings.siteName)}</title>
  <link>${escapeXml(homeUrl)}</link>
  <description>${escapeXml(settings.siteDescription)}</description>
  <language>${locale}</language>
  ${items}
</channel>
</rss>`
  return new Response(xml, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
