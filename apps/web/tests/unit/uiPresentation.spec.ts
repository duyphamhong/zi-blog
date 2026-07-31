import { describe, expect, it } from 'vitest'

import { getCoverArtworkVariant } from '@/modules/content/presentation/coverArtwork'
import { getFooterCopyrightYear } from '@/modules/platform/footer'
import { resolveThemePreference } from '@/modules/platform/theme/preference'

describe('public UI presentation rules', () => {
  it('selects deterministic technical artwork from content identity', () => {
    expect(getCoverArtworkVariant('kien-truc-modular-monolith')).toBe('architecture')
    expect(getCoverArtworkVariant('operations-observability')).toBe('operations')
    expect(getCoverArtworkVariant('payload-typescript')).toBe('tooling')
    expect(getCoverArtworkVariant('payload-typescript')).toBe(
      getCoverArtworkVariant('payload-typescript'),
    )
  })

  it('resolves explicit and system theme preferences', () => {
    expect(resolveThemePreference({ preference: 'dark', prefersDark: false })).toBe('dark')
    expect(resolveThemePreference({ preference: 'light', prefersDark: true })).toBe('light')
    expect(resolveThemePreference({ preference: 'system', prefersDark: true })).toBe('dark')
    expect(resolveThemePreference({ preference: 'system', prefersDark: false })).toBe('light')
  })

  it('uses the server date for the footer copyright year', () => {
    expect(getFooterCopyrightYear(new Date('2026-07-31T00:00:00.000Z'))).toBe(2026)
  })
})
