import Link from 'next/link'

import type { PublicNavigation } from '@/modules/platform'
import type { AppDictionary } from '@/modules/platform'

import { Container } from './Container'

export function SiteFooter({
  dictionary,
  navigation,
}: {
  dictionary: AppDictionary
  navigation: PublicNavigation
}) {
  return (
    <footer className="mt-20 border-t border-slate-200 py-10 dark:border-slate-800">
      <Container className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="font-bold">Zi-Blog</p>
          <p className="mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
            {navigation.footerText || dictionary.footer.fallback}
          </p>
        </div>
        <nav aria-label={dictionary.footer.navigation} className="sm:text-right">
          <ul className="flex flex-wrap gap-4 sm:justify-end">
            {navigation.footerLinks.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link
                  className="text-sm text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
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
      </Container>
    </footer>
  )
}
