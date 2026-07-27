import { NextResponse, type NextRequest } from 'next/server'

import { DEFAULT_CONTENT_LOCALE, parseContentLocale } from '@/modules/platform/i18n/config'

export function proxy(request: NextRequest): NextResponse {
  const firstSegment = request.nextUrl.pathname.split('/').filter(Boolean)[0]
  const locale = parseContentLocale(firstSegment) ?? DEFAULT_CONTENT_LOCALE
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-zi-blog-locale', locale)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!admin|api|_next|media|favicon.ico|robots.txt|sitemap.xml).*)'],
}
