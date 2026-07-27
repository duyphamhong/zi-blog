import { notFound } from 'next/navigation'

import { AuthorSummary } from '@/components/content/AuthorSummary'
import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getPostsByAuthorUsername } from '@/modules/content'
import {
  getDictionary,
  getPublicAuthorProfile,
  localePath,
  parseContentLocale,
} from '@/modules/platform'

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; username: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [route, query] = await Promise.all([params, searchParams])
  const locale = parseContentLocale(route.locale)
  if (!locale) notFound()
  const page = Number(query.page) || 1
  const [author, posts, dictionary] = await Promise.all([
    getPublicAuthorProfile({ locale, username: route.username }),
    getPostsByAuthorUsername({ locale, page, username: route.username }),
    getDictionary(locale),
  ])
  if (!author) notFound()
  return (
    <Container className="py-12">
      <h1 className="sr-only">
        {dictionary.post.authorHeading} {author.displayName}
      </h1>
      <AuthorSummary author={author} />
      <section aria-labelledby="author-posts" className="mt-12">
        <h2 className="mb-7 text-3xl font-black" id="author-posts">
          {dictionary.post.publishedPosts}
        </h2>
        {posts.posts.length ? (
          <PostList dictionary={dictionary} locale={locale} posts={posts.posts} />
        ) : (
          <EmptyState description={dictionary.post.authorEmpty} />
        )}
      </section>
      <Pagination
        basePath={localePath(locale, `/authors/${route.username}`)}
        dictionary={dictionary}
        {...posts}
      />
    </Container>
  )
}
