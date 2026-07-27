import { permanentRedirect } from 'next/navigation'

import { DEFAULT_CONTENT_LOCALE, localePath } from '@/modules/platform'

export default async function LegacySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const path = localePath(DEFAULT_CONTENT_LOCALE, '/search')
  permanentRedirect(q ? `${path}?q=${encodeURIComponent(q)}` : path)
}
