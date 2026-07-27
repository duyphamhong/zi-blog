import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { AuthorSummary } from '@/components/content/AuthorSummary'
import { ResponsiveMedia } from '@/components/content/ResponsiveMedia'
import { RichTextRenderer } from '@/components/content/RichTextRenderer'
import { TaxonomyLinks } from '@/components/content/TaxonomyLinks'
import { Container } from '@/components/layout/Container'
import { getAuthorizedDraftPost } from '@/modules/content'
import { formatDate, getDictionary, parseContentLocale } from '@/modules/platform'

type RouteProps = { params: Promise<{ id: string; locale: string }> }

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: 'Content preview',
}

export default async function PostPreviewPage({ params }: RouteProps) {
  const route = await params
  const locale = parseContentLocale(route.locale)
  const id = Number(route.id)
  if (!locale || !Number.isInteger(id) || id <= 0) notFound()

  const post = await getAuthorizedDraftPost({
    headers: await headers(),
    id,
    locale,
  })
  if (!post) notFound()
  const dictionary = await getDictionary(locale)

  return (
    <Container className="py-12">
      <div
        className="mx-auto mb-8 max-w-4xl rounded-xl border border-amber-400 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-950"
        role="status"
      >
        {locale === 'vi'
          ? 'Bản xem trước được bảo vệ — nội dung này chưa được xuất bản.'
          : 'Protected preview — this content may not be published.'}
      </div>
      <article className="mx-auto max-w-4xl">
        <TaxonomyLinks category={post.category} locale={locale} tags={post.tags} />
        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">{post.title}</h1>
        <p className="mt-6 text-xl leading-8 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          {formatDate(post.publishedAt, locale)} · {post.readingTimeMinutes}{' '}
          {dictionary.post.minRead}
        </p>
        {post.coverImage ? (
          <ResponsiveMedia
            className="mt-10 aspect-[16/9] w-full rounded-2xl object-cover"
            media={post.coverImage}
            priority
          />
        ) : null}
        <div className="mt-10">
          <RichTextRenderer content={post.content} locale={locale} />
        </div>
        <div className="mt-12">
          <AuthorSummary author={post.author} />
        </div>
      </article>
    </Container>
  )
}
