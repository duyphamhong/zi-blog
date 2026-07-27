import { notFound } from 'next/navigation'

import { AuthorSummary } from '@/components/content/AuthorSummary'
import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getPostsByAuthorUsername } from '@/modules/content'
import { getPublicAuthorProfile } from '@/modules/platform'

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ username }, query] = await Promise.all([params, searchParams])
  const page = Number(query.page) || 1
  const [author, posts] = await Promise.all([
    getPublicAuthorProfile(username),
    getPostsByAuthorUsername({ page, username }),
  ])
  if (!author) notFound()

  return (
    <Container className="py-12">
      <h1 className="sr-only">Posts by {author.displayName}</h1>
      <AuthorSummary author={author} />
      <section aria-labelledby="author-posts" className="mt-12">
        <h2 className="mb-7 text-3xl font-black" id="author-posts">
          Published posts
        </h2>
        {posts.posts.length ? (
          <PostList posts={posts.posts} />
        ) : (
          <EmptyState description="This author has no published posts." />
        )}
      </section>
      <Pagination basePath={`/authors/${username}`} {...posts} />
    </Container>
  )
}
