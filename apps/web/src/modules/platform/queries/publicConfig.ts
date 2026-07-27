import type { Navigation, SiteSetting } from '@/payload-types'
import { getPayloadClient } from '@/shared/payload/client'

export type PublicSiteSettings = Pick<
  SiteSetting,
  | 'defaultSeoDescription'
  | 'defaultSeoTitle'
  | 'enableDarkMode'
  | 'postsPerPage'
  | 'siteDescription'
  | 'siteName'
  | 'siteUrl'
>

export type PublicNavigationLink = {
  href: string
  label: string
  openInNewTab: boolean
}

export type PublicNavigation = {
  footerLinks: PublicNavigationLink[]
  footerText?: string | null
  headerLinks: PublicNavigationLink[]
  socialLinks: { label: string; url: string }[]
}

function referenceHref(reference: unknown): string | null {
  if (!reference || typeof reference !== 'object' || !('relationTo' in reference)) return null
  if (!('value' in reference) || !reference.value || typeof reference.value !== 'object')
    return null
  if (!('slug' in reference.value) || typeof reference.value.slug !== 'string') return null

  if (reference.relationTo === 'posts') return `/posts/${reference.value.slug}`
  if (reference.relationTo === 'categories') return `/categories/${reference.value.slug}`
  if (reference.relationTo === 'series') return `/series/${reference.value.slug}`
  return null
}

function projectLinks(
  links: Navigation['headerLinks'] | Navigation['footerLinks'],
): PublicNavigationLink[] {
  return (
    links?.flatMap((link) => {
      const href = link.type === 'external' ? link.url : referenceHref(link.reference)
      return href ? [{ href, label: link.label, openInNewTab: Boolean(link.openInNewTab) }] : []
    }) ?? []
  )
}

async function queryPublicSiteSettings(): Promise<PublicSiteSettings> {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
    overrideAccess: true,
  })
  return {
    defaultSeoDescription: settings.defaultSeoDescription,
    defaultSeoTitle: settings.defaultSeoTitle,
    enableDarkMode: settings.enableDarkMode,
    postsPerPage: settings.postsPerPage,
    siteDescription: settings.siteDescription,
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
  }
}

const getPublicSiteSettingsCached = unstable_cache(
  queryPublicSiteSettings,
  ['public-site-settings'],
  { revalidate: 300, tags: [cacheTags.settings] },
)

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  return getPublicSiteSettingsCached()
}

async function queryPublicNavigation(): Promise<PublicNavigation> {
  const payload = await getPayloadClient()
  const navigation = await payload.findGlobal({
    slug: 'navigation',
    depth: 2,
    overrideAccess: true,
  })
  return {
    footerLinks: projectLinks(navigation.footerLinks),
    footerText: navigation.footerText,
    headerLinks: projectLinks(navigation.headerLinks),
    socialLinks:
      navigation.socialLinks?.map(({ label, url }) => ({
        label,
        url,
      })) ?? [],
  }
}

const getPublicNavigationCached = unstable_cache(queryPublicNavigation, ['public-navigation'], {
  revalidate: 300,
  tags: [cacheTags.navigation],
})

export async function getPublicNavigation(): Promise<PublicNavigation> {
  return getPublicNavigationCached()
}
import { unstable_cache } from 'next/cache'

import { cacheTags } from '@/modules/platform/cache/tags'
