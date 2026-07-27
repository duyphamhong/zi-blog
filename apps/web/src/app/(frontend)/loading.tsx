import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Container } from '@/components/layout/Container'
import { headers } from 'next/headers'
import { DEFAULT_CONTENT_LOCALE, getDictionary, parseContentLocale } from '@/modules/platform'

export default async function Loading() {
  const locale =
    parseContentLocale((await headers()).get('x-zi-blog-locale')) ?? DEFAULT_CONTENT_LOCALE
  const dictionary = await getDictionary(locale)
  return (
    <Container className="py-12">
      <LoadingSkeleton label={dictionary.accessibility.loading} />
    </Container>
  )
}
