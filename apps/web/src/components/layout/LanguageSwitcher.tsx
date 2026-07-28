'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  alternateLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_METADATA,
  type ContentLocale,
} from '@/modules/platform/i18n/config'

export function LanguageSwitcher({
  ariaLabel,
  currentLocale,
}: {
  ariaLabel: string
  currentLocale: ContentLocale
}) {
  const pathname = usePathname()
  const targetLocale = alternateLocale(currentLocale)
  const [resolution, setResolution] = useState<{
    locale: ContentLocale
    path: null | string
    pathname: string
  } | null>(null)
  const resolved = resolution?.locale === targetLocale && resolution.pathname === pathname
  const targetPath = resolved ? resolution.path : null

  useEffect(() => {
    const controller = new AbortController()
    const search = new URLSearchParams({ locale: targetLocale, pathname })
    fetch(`/api/locale/alternate?${search}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((result: { path?: null | string }) => {
        setResolution({
          locale: targetLocale,
          path: result.path ?? null,
          pathname,
        })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setResolution({ locale: targetLocale, path: null, pathname })
      })
    return () => controller.abort()
  }, [pathname, targetLocale])

  function switchLanguage(): void {
    if (!targetPath) return
    document.cookie = `${LOCALE_COOKIE_NAME}=${targetLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
    // The locale controls the root <html lang> attribute. A document navigation
    // guarantees that the root layout is rendered again for the new language.
    window.location.assign(targetPath)
  }

  return (
    <button
      aria-label={`${ariaLabel}: ${LOCALE_METADATA[targetLocale].label}`}
      className="min-h-11 rounded-control border border-border-subtle bg-surface px-3 py-2 text-sm font-bold text-text-secondary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
      disabled={!resolved || !targetPath}
      lang={LOCALE_METADATA[targetLocale].htmlLang}
      onClick={switchLanguage}
      title={
        resolved && !targetPath
          ? currentLocale === 'vi'
            ? 'Bản dịch tiếng Anh chưa có'
            : 'Vietnamese translation is unavailable'
          : undefined
      }
      type="button"
    >
      {LOCALE_METADATA[targetLocale].label}
    </button>
  )
}
