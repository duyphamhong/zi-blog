'use client'

import { IconButton } from '@/components/ui/IconButton'
import { ThemeIcon } from '@/components/ui/Icons'
import { THEME_COOKIE_NAME } from '@/modules/platform/theme/preference'

export function ThemeToggle({ ariaLabel }: { ariaLabel: string }) {
  function toggleTheme(): void {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    const next = current === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.dataset.theme = next
    document.cookie = `${THEME_COOKIE_NAME}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
  }

  return (
    <IconButton aria-label={ariaLabel} onClick={toggleTheme} title={ariaLabel} type="button">
      <ThemeIcon />
    </IconButton>
  )
}
