import { notFound, permanentRedirect } from 'next/navigation'

import { resolveLegacyPublicPath } from '@/modules/content'

export default async function LegacyPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const path = await resolveLegacyPublicPath({ route: 'posts', slug })
  if (!path) notFound()
  permanentRedirect(path)
}
