import type { MetadataRoute } from 'next'

import { getPublicSiteSettings } from '@/modules/platform'

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPublicSiteSettings()
  return {
    host: settings.siteUrl,
    rules: {
      allow: '/',
      disallow: ['/admin/', '/api/', '/graphql'],
      userAgent: '*',
    },
    sitemap: `${settings.siteUrl}/sitemap.xml`,
  }
}
