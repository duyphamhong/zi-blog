import { buildLocalizedRss } from '@/modules/seo'
import { parseContentLocale } from '@/modules/platform'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
): Promise<Response> {
  const { locale: value } = await params
  const locale = parseContentLocale(value)
  return locale ? buildLocalizedRss(locale) : new Response('Not found', { status: 404 })
}
