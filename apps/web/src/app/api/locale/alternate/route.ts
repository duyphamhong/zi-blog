import { NextResponse } from 'next/server'

import { resolveAlternatePublicPath } from '@/modules/content'
import { parseContentLocale } from '@/modules/platform'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const locale = parseContentLocale(url.searchParams.get('locale'))
  const pathname = url.searchParams.get('pathname')
  if (!locale || !pathname || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return NextResponse.json({ code: 'INVALID_LOCALE_REQUEST' }, { status: 400 })
  }
  const path = await resolveAlternatePublicPath({ pathname, targetLocale: locale })
  return NextResponse.json({ available: Boolean(path), path })
}
