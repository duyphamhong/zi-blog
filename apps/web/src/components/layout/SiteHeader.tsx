import Link from 'next/link'

import { SearchDialog } from '@/modules/search/ui/SearchDialog'
import type { PublicNavigation } from '@/modules/platform'
import { localePath, type AppDictionary, type ContentLocale } from '@/modules/platform'

import { Container } from './Container'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNavigation } from './MobileNavigation'
import { NavigationLinks } from './NavigationLinks'
import { ThemeToggle } from './ThemeToggle'

export function SiteHeader({
  dictionary,
  enableDarkMode,
  locale,
  navigation,
}: {
  dictionary: AppDictionary
  enableDarkMode: boolean
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
        ]

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/92 backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-4">
        <Link
          className="shrink-0 text-2xl font-black tracking-tight text-brand sm:text-[1.7rem]"
          href={localePath(locale)}
        >
          Zi-Blog
        </Link>
        <nav aria-label={dictionary.accessibility.primaryNavigation} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            <NavigationLinks links={links} />
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <SearchDialog action={localePath(locale, '/search')} dictionary={dictionary} />
          {enableDarkMode ? <ThemeToggle ariaLabel={dictionary.accessibility.themeToggle} /> : null}
          <div className="hidden lg:block">
            <LanguageSwitcher
              ariaLabel={dictionary.accessibility.languageSwitcher}
              currentLocale={locale}
            />
          </div>
          <MobileNavigation dictionary={dictionary} links={links} locale={locale} />
        </div>
      </Container>
    </header>
  )
}
