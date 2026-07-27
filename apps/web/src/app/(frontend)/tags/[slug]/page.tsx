import { notFound, permanentRedirect } from 'next/navigation'

import { resolveLegacyPublicPath } from '@/modules/content'

export default async function LegacyTagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const path = await resolveLegacyPublicPath({ route: 'tags', slug })
  if (!path) notFound()
  permanentRedirect(path)
}
