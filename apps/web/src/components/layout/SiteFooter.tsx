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
    <footer className="mt-24 border-t border-border-subtle bg-surface py-12">
      <Container className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xl font-black text-brand">Zi-Blog</p>
          <p className="mt-3 max-w-lg text-sm leading-6 text-text-secondary">
            {navigation.footerText || dictionary.footer.fallback}
          </p>
          <p className="mt-5 text-xs text-text-muted">
            © {new Date().getFullYear()} Zi-Blog. {dictionary.footer.rights}
          </p>
        </div>
        <div className="space-y-5 md:text-right">
          <nav aria-label={dictionary.footer.navigation}>
            <ul className="flex flex-wrap gap-4 md:justify-end">
              {navigation.footerLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    className="text-sm font-bold text-text-secondary hover:text-brand hover:underline"
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
          {navigation.socialLinks.length > 0 ? (
            <ul className="flex flex-wrap gap-4 md:justify-end">
              {navigation.socialLinks.map((link) => (
                <li key={`${link.url}-${link.label}`}>
                  <a
                    className="text-sm text-text-muted hover:text-brand"
                    href={link.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </footer>
  )
}
