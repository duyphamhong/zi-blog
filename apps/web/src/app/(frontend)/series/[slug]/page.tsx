import { notFound, permanentRedirect } from 'next/navigation'

import { resolveLegacyPublicPath } from '@/modules/content'

export default async function LegacySeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const path = await resolveLegacyPublicPath({ route: 'series', slug })
  if (!path) notFound()
  permanentRedirect(path)
}
