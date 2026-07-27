import { permanentRedirect } from 'next/navigation'

import { DEFAULT_CONTENT_LOCALE, localePath } from '@/modules/platform'

export default async function LegacyAuthorPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  permanentRedirect(localePath(DEFAULT_CONTENT_LOCALE, `/authors/${username}`))
}
