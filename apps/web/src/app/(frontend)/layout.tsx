import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import Script from 'next/script'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import {
  DEFAULT_CONTENT_LOCALE,
  getDictionary,
  getPublicNavigation,
  getPublicSiteSettings,
  LOCALE_METADATA,
  parseContentLocale,
} from '@/modules/platform'

import './globals.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale =
    parseContentLocale((await headers()).get('x-zi-blog-locale')) ?? DEFAULT_CONTENT_LOCALE
  const settings = await getPublicSiteSettings(locale)
  return {
    description: settings.defaultSeoDescription || settings.siteDescription,
    metadataBase: new URL(settings.siteUrl),
    title: {
      default: settings.defaultSeoTitle || settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
  }
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const locale =
    parseContentLocale((await headers()).get('x-zi-blog-locale')) ?? DEFAULT_CONTENT_LOCALE
  const [settings, navigation, dictionary] = await Promise.all([
    getPublicSiteSettings(locale),
    getPublicNavigation(locale),
    getDictionary(locale),
  ])

  return (
    <html
      data-dark-mode={settings.enableDarkMode ? 'true' : 'false'}
      data-scroll-behavior="smooth"
      lang={LOCALE_METADATA[locale].htmlLang}
      suppressHydrationWarning
    >
      <head>
        {settings.enableDarkMode ? (
          <Script src="/theme-init.js" strategy="beforeInteractive" />
        ) : null}
      </head>
      <body>
        <a
          className="sr-only z-50 rounded bg-white p-3 text-slate-950 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
          href="#main-content"
        >
          {dictionary.accessibility.skipToContent}
        </a>
        <SiteHeader
          dictionary={dictionary}
          enableDarkMode={Boolean(settings.enableDarkMode)}
          locale={locale}
          navigation={navigation}
        />
        <main id="main-content">{children}</main>
        <SiteFooter dictionary={dictionary} navigation={navigation} />
      </body>
    </html>
  )
}
