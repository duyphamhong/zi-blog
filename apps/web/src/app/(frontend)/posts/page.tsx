import { permanentRedirect } from 'next/navigation'

import { DEFAULT_CONTENT_LOCALE, localePath } from '@/modules/platform'

export default function LegacyPostsPage() {
  permanentRedirect(localePath(DEFAULT_CONTENT_LOCALE, '/posts'))
}
