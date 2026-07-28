import { unstable_cache } from 'next/cache'

import { env } from '@/config/env'
import type { Navigation, SiteSetting } from '@/payload-types'
import { getPayloadClient } from '@/shared/payload/client'

import { cacheTags } from '../cache/tags'
import { localePath, type ContentLocale } from '../i18n'
import { enDictionary } from '../i18n/dictionaries/en'
import { viDictionary } from '../i18n/dictionaries/vi'

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

function referenceHref(reference: unknown, locale: ContentLocale): string | null {
  if (!reference || typeof reference !== 'object' || !('relationTo' in reference)) return null
  if (!('value' in reference) || !reference.value || typeof reference.value !== 'object')
    return null
  if (!('slug' in reference.value) || typeof reference.value.slug !== 'string') return null

  if (reference.relationTo === 'posts') return localePath(locale, `/posts/${reference.value.slug}`)
  if (reference.relationTo === 'categories')
    return localePath(locale, `/categories/${reference.value.slug}`)
  if (reference.relationTo === 'series')
    return localePath(locale, `/series/${reference.value.slug}`)
  return null
}

function projectLinks(
  links: Navigation['headerLinks'] | Navigation['footerLinks'],
  locale: ContentLocale,
  placement: 'footer' | 'header',
): PublicNavigationLink[] {
  const dictionary = locale === 'vi' ? viDictionary : enDictionary
  return (
    links?.flatMap((link) => {
      const href = link.type === 'external' ? link.url : referenceHref(link.reference, locale)
      const configuredLabel = typeof link.label === 'string' ? link.label.trim() : ''
      const reference = link.reference && typeof link.reference === 'object' ? link.reference : null
      const referenceValue =
        reference && 'value' in reference && reference.value && typeof reference.value === 'object'
          ? reference.value
          : null
      const label =
        configuredLabel ||
        (reference?.relationTo === 'categories' &&
        referenceValue &&
        'name' in referenceValue &&
        typeof referenceValue.name === 'string'
          ? referenceValue.name
          : reference?.relationTo === 'series'
            ? dictionary.navigation.series
            : reference?.relationTo === 'posts'
              ? placement === 'header'
                ? dictionary.navigation.featured
                : dictionary.navigation.posts
              : '')
      return href && label ? [{ href, label, openInNewTab: Boolean(link.openInNewTab) }] : []
    }) ?? []
  )
}

async function queryPublicSiteSettings(locale: ContentLocale): Promise<PublicSiteSettings> {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
    fallbackLocale: false,
    locale,
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
  ['public-site-settings-by-locale'],
  { revalidate: 300, tags: [cacheTags.settings] },
)

export function getPublicSiteSettings(locale: ContentLocale): Promise<PublicSiteSettings> {
  return env.NODE_ENV === 'test'
    ? queryPublicSiteSettings(locale)
    : getPublicSiteSettingsCached(locale)
}

async function queryPublicNavigation(locale: ContentLocale): Promise<PublicNavigation> {
  const payload = await getPayloadClient()
  const navigation = await payload.findGlobal({
    slug: 'navigation',
    depth: 2,
    fallbackLocale: false,
    locale,
    overrideAccess: true,
  })
  return {
    footerLinks: projectLinks(navigation.footerLinks, locale, 'footer'),
    footerText: navigation.footerText,
    headerLinks: projectLinks(navigation.headerLinks, locale, 'header'),
    socialLinks:
      navigation.socialLinks?.map(({ label, url }) => ({
        label,
        url,
      })) ?? [],
  }
}

const getPublicNavigationCached = unstable_cache(
  queryPublicNavigation,
  ['public-navigation-by-locale-v2'],
  { revalidate: 300, tags: [cacheTags.navigation] },
)

export function getPublicNavigation(locale: ContentLocale): Promise<PublicNavigation> {
  return env.NODE_ENV === 'test' ? queryPublicNavigation(locale) : getPublicNavigationCached(locale)
}
