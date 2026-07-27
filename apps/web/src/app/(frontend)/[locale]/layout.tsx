import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { parseContentLocale } from '@/modules/platform'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!parseContentLocale(locale)) notFound()
  return children
}
