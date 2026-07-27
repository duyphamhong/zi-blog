import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { getPublicNavigation, getPublicSiteSettings } from '@/modules/platform'

import './globals.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings()
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
  const [settings, navigation] = await Promise.all([getPublicSiteSettings(), getPublicNavigation()])

  return (
    <html data-dark-mode={settings.enableDarkMode ? 'true' : 'false'} lang="en">
      <body>
        <a
          className="sr-only z-50 rounded bg-white p-3 text-slate-950 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
          href="#main-content"
        >
          Skip to content
        </a>
        <SiteHeader navigation={navigation} />
        <main id="main-content">{children}</main>
        <SiteFooter navigation={navigation} />
      </body>
    </html>
  )
}
