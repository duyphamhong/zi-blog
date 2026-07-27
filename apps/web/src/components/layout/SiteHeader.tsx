import Link from 'next/link'

import type { PublicNavigation } from '@/modules/platform'
import { localePath, type AppDictionary, type ContentLocale } from '@/modules/platform'

import { Container } from './Container'
import { LanguageSwitcher } from './LanguageSwitcher'

export function SiteHeader({
  dictionary,
  locale,
  navigation,
}: {
  dictionary: AppDictionary
  locale: ContentLocale
  navigation: PublicNavigation
}) {
  const links =
    navigation.headerLinks.length > 0
      ? navigation.headerLinks
      : [
          {
            href: localePath(locale, '/posts'),
            label: dictionary.navigation.posts,
            openInNewTab: false,
          },
          {
            href: localePath(locale, '/search'),
            label: dictionary.navigation.search,
            openInNewTab: false,
          },
        ]

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <Container className="flex min-h-16 items-center justify-between gap-6">
        <Link
          className="text-lg font-black tracking-tight text-cyan-700 dark:text-cyan-300"
          href={localePath(locale)}
        >
          Zi-Blog
        </Link>
        <div className="flex items-center gap-4">
          <nav aria-label={dictionary.accessibility.primaryNavigation}>
            <ul className="flex flex-wrap items-center gap-4 text-sm font-semibold">
              {links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    className="rounded px-1 py-2 text-slate-700 hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-cyan-600 dark:text-slate-200 dark:hover:text-cyan-300"
                    href={link.href}
                    rel={link.openInNewTab ? 'noreferrer' : undefined}
                    target={link.openInNewTab ? '_blank' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitcher
            ariaLabel={dictionary.accessibility.languageSwitcher}
            currentLocale={locale}
          />
        </div>
      </Container>
    </header>
  )
}
