import { permanentRedirect } from 'next/navigation'

import { DEFAULT_CONTENT_LOCALE, localePath } from '@/modules/platform'

export function GET(): Response {
  permanentRedirect(localePath(DEFAULT_CONTENT_LOCALE, '/rss.xml'))
}
