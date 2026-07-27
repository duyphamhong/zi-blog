import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { headers } from 'next/headers'
import {
  DEFAULT_CONTENT_LOCALE,
  getDictionary,
  localePath,
  parseContentLocale,
} from '@/modules/platform'

export default async function NotFound() {
  const locale =
    parseContentLocale((await headers()).get('x-zi-blog-locale')) ?? DEFAULT_CONTENT_LOCALE
  const dictionary = await getDictionary(locale)
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-700">404</p>
      <h1 className="mt-4 text-4xl font-black">{dictionary.notFound.heading}</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">{dictionary.notFound.description}</p>
      <Link
        className="mt-8 inline-flex rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white"
        href={localePath(locale)}
      >
        {dictionary.notFound.returnHome}
      </Link>
    </Container>
  )
}
