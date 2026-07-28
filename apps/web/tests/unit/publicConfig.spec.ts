import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { resolvePublicSiteUrl } from '@/modules/platform/queries/publicConfig'

describe('resolvePublicSiteUrl', () => {
  it.each([undefined, '', 'undefined', 'not a URL', 'ftp://example.com'])(
    'falls back to the configured server URL for invalid stored values: %j',
    (siteUrl) => {
      expect(resolvePublicSiteUrl(siteUrl)).toBe(env.SERVER_URL)
    },
  )

  it('normalizes a valid public URL to its origin', () => {
    expect(resolvePublicSiteUrl('https://blog.example.com/landing')).toBe(
      'https://blog.example.com',
    )
  })
})
