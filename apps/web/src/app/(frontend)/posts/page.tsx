import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getLatestPosts } from '@/modules/content'

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const result = await getLatestPosts({ page })

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-black">All posts</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Published engineering notes, newest first.
      </p>
      <div className="mt-10">
        {result.posts.length ? (
          <PostList posts={result.posts} />
        ) : (
          <EmptyState description="No published posts are available." />
        )}
      </div>
      <Pagination basePath="/posts" {...result} />
    </Container>
  )
}
