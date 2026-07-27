import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { searchPublishedPosts } from '@/modules/content'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const page = Number(params.page) || 1
  const results = query.length >= 2 ? await searchPublishedPosts({ page, query }) : null

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-black">Search</h1>
      <form action="/search" className="mt-8 flex max-w-2xl gap-3" role="search">
        <label className="sr-only" htmlFor="search-query">
          Search published posts
        </label>
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          defaultValue={query}
          id="search-query"
          maxLength={100}
          minLength={2}
          name="q"
          placeholder="Search title or excerpt"
          required
          type="search"
        />
        <button
          className="rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white hover:bg-cyan-800"
          type="submit"
        >
          Search
        </button>
      </form>
      <section aria-live="polite" className="mt-10">
        {!query ? (
          <EmptyState
            description="Enter at least two characters to search published public posts."
            title="Start a search"
          />
        ) : query.length < 2 || query.length > 100 ? (
          <EmptyState
            description="Search queries must contain between 2 and 100 characters."
            title="Check your search"
          />
        ) : results?.posts.length ? (
          <>
            <h2 className="mb-6 text-xl font-bold">Results for “{query}”</h2>
            <PostList posts={results.posts} />
          </>
        ) : (
          <EmptyState description={`No published posts matched “${query}”.`} title="No results" />
        )}
      </section>
      {results ? <Pagination basePath="/search" query={{ q: query }} {...results} /> : null}
    </Container>
  )
}
