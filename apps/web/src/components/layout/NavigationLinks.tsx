'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { PublicNavigationLink } from '@/modules/platform'

export function NavigationLinks({
  links,
  onNavigate,
}: {
  links: PublicNavigationLink[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <li key={`${link.href}-${link.label}`}>
            <Link
              aria-current={active ? 'page' : undefined}
              className="relative inline-flex rounded-lg px-3 py-2 text-sm font-bold text-text-secondary transition hover:bg-brand-soft hover:text-brand aria-[current=page]:text-brand motion-reduce:transition-none"
              href={link.href}
              onClick={onNavigate}
              rel={link.openInNewTab ? 'noreferrer' : undefined}
              target={link.openInNewTab ? '_blank' : undefined}
            >
              {link.label}
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-[0.82rem] h-0.5 rounded-full bg-brand"
                />
              ) : null}
            </Link>
          </li>
        )
      })}
    </>
  )
}
