import { notFound } from 'next/navigation'

import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getLatestPosts } from '@/modules/content'
import { getDictionary, localePath, parseContentLocale } from '@/modules/platform'

export default async function PostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [route, query] = await Promise.all([params, searchParams])
  const locale = parseContentLocale(route.locale)
  if (!locale) notFound()
  const page = Number(query.page) || 1
  const [result, dictionary] = await Promise.all([
    getLatestPosts({ locale, page }),
    getDictionary(locale),
  ])

  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">
        {dictionary.home.eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
        {dictionary.post.allPosts}
      </h1>
      <p className="mt-4 max-w-2xl text-text-secondary">{dictionary.post.allDescription}</p>
      <div className="mt-10">
        {result.posts.length ? (
          <PostList dictionary={dictionary} locale={locale} posts={result.posts} />
        ) : (
          <EmptyState description={dictionary.post.noPosts} />
        )}
      </div>
      <Pagination basePath={localePath(locale, '/posts')} dictionary={dictionary} {...result} />
    </Container>
  )
}
