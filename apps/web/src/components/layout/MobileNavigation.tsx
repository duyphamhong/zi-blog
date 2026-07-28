'use client'

import { useRef } from 'react'

import { CloseIcon, MenuIcon } from '@/components/ui/Icons'
import { IconButton } from '@/components/ui/IconButton'
import type { AppDictionary, ContentLocale, PublicNavigationLink } from '@/modules/platform'

import { LanguageSwitcher } from './LanguageSwitcher'
import { NavigationLinks } from './NavigationLinks'

export function MobileNavigation({
  dictionary,
  links,
  locale,
}: {
  dictionary: AppDictionary
  links: PublicNavigationLink[]
  locale: ContentLocale
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function close(): void {
    dialogRef.current?.close()
    triggerRef.current?.focus()
  }

  return (
    <div className="lg:hidden">
      <IconButton
        aria-label={dictionary.accessibility.openMenu}
        onClick={() => dialogRef.current?.showModal()}
        ref={triggerRef}
        type="button"
      >
        <MenuIcon />
      </IconButton>
      <dialog
        aria-labelledby="mobile-navigation-title"
        className="ml-auto h-dvh w-[min(22rem,calc(100%-2rem))] max-w-none border-0 border-l border-border-subtle bg-surface p-0 text-text-primary shadow-2xl"
        ref={dialogRef}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 className="text-lg font-black" id="mobile-navigation-title">
            {dictionary.accessibility.mobileNavigation}
          </h2>
          <button
            aria-label={dictionary.accessibility.close}
            className="rounded-lg p-2 hover:bg-brand-soft hover:text-brand"
            onClick={close}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label={dictionary.accessibility.primaryNavigation} className="p-5">
          <ul className="grid gap-2 text-lg">
            <NavigationLinks links={links} onNavigate={close} />
          </ul>
        </nav>
        <div className="border-t border-border-subtle p-5 lg:hidden">
          <LanguageSwitcher
            ariaLabel={dictionary.accessibility.languageSwitcher}
            currentLocale={locale}
          />
        </div>
      </dialog>
    </div>
  )
}
