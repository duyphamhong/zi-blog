import { notFound } from 'next/navigation'

import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getPostsByTagSlug, getPublicTagBySlug } from '@/modules/content'

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const page = Number(query.page) || 1
  const [tag, posts] = await Promise.all([
    getPublicTagBySlug(slug),
    getPostsByTagSlug({ page, slug }),
  ])
  if (!tag) notFound()

  return (
    <Container className="py-12">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-700">Tag</p>
      <h1 className="mt-3 text-4xl font-black">#{tag.name}</h1>
      {tag.description ? <p className="mt-4 max-w-2xl text-slate-600">{tag.description}</p> : null}
      <div className="mt-10">
        {posts.posts.length ? (
          <PostList posts={posts.posts} />
        ) : (
          <EmptyState description="This tag has no published posts." />
        )}
      </div>
      <Pagination basePath={`/tags/${slug}`} {...posts} />
    </Container>
  )
}
