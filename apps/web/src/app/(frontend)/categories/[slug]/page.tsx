import { notFound } from 'next/navigation'

import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getPostsByCategorySlug, getPublicCategoryBySlug } from '@/modules/content'

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const page = Number(query.page) || 1
  const [category, posts] = await Promise.all([
    getPublicCategoryBySlug(slug),
    getPostsByCategorySlug({ page, slug }),
  ])
  if (!category) notFound()

  return (
    <Container className="py-12">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-700">Category</p>
      <h1 className="mt-3 text-4xl font-black">{category.name}</h1>
      {category.description ? (
        <p className="mt-4 max-w-2xl text-slate-600">{category.description}</p>
      ) : null}
      <div className="mt-10">
        {posts.posts.length ? (
          <PostList posts={posts.posts} />
        ) : (
          <EmptyState description="This category has no published posts." />
        )}
      </div>
      <Pagination basePath={`/categories/${slug}`} {...posts} />
    </Container>
  )
}
