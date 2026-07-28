import { notFound } from 'next/navigation'

import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getPostsBySeriesSlug, getSeriesBySlug } from '@/modules/content'
import { getDictionary, localePath, parseContentLocale } from '@/modules/platform'

export default async function SeriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [route, query] = await Promise.all([params, searchParams])
  const locale = parseContentLocale(route.locale)
  if (!locale) notFound()
  const page = Number(query.page) || 1
  const [series, posts, dictionary] = await Promise.all([
    getSeriesBySlug({ locale, slug: route.slug }),
    getPostsBySeriesSlug({ locale, page, slug: route.slug }),
    getDictionary(locale),
  ])
  if (!series) notFound()
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">
        {dictionary.common.series}
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{series.title}</h1>
      {series.description ? (
        <p className="mt-4 max-w-2xl text-text-secondary">{series.description}</p>
      ) : null}
      <div className="mt-10">
        {posts.posts.length ? (
          <PostList dictionary={dictionary} locale={locale} posts={posts.posts} />
        ) : (
          <EmptyState description={dictionary.post.seriesEmpty} />
        )}
      </div>
      <Pagination
        basePath={localePath(locale, `/series/${route.slug}`)}
        dictionary={dictionary}
        {...posts}
      />
    </Container>
  )
}
