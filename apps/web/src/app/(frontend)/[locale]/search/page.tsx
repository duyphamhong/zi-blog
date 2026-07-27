import { notFound } from 'next/navigation'

import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { searchPublishedPosts } from '@/modules/content'
import { getDictionary, localePath, parseContentLocale } from '@/modules/platform'

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const [route, queryParams] = await Promise.all([params, searchParams])
  const locale = parseContentLocale(route.locale)
  if (!locale) notFound()
  const dictionary = await getDictionary(locale)
  const query = queryParams.q?.trim() ?? ''
  const page = Number(queryParams.page) || 1
  const results = query.length >= 2 ? await searchPublishedPosts({ locale, page, query }) : null

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-black">{dictionary.search.title}</h1>
      <form
        action={localePath(locale, '/search')}
        className="mt-8 flex max-w-2xl gap-3"
        role="search"
      >
        <label className="sr-only" htmlFor="search-query">
          {dictionary.search.label}
        </label>
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          defaultValue={query}
          id="search-query"
          maxLength={100}
          minLength={2}
          name="q"
          placeholder={dictionary.search.placeholder}
          required
          type="search"
        />
        <button
          className="rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white hover:bg-cyan-800"
          type="submit"
        >
          {dictionary.search.button}
        </button>
      </form>
      <section aria-live="polite" className="mt-10">
        {!query ? (
          <EmptyState
            description={dictionary.search.emptyDescription}
            title={dictionary.search.emptyTitle}
          />
        ) : query.length < 2 || query.length > 100 ? (
          <EmptyState
            description={dictionary.search.checkDescription}
            title={dictionary.search.checkTitle}
          />
        ) : results?.posts.length ? (
          <>
            <h2 className="mb-6 text-xl font-bold">
              {dictionary.search.resultsFor} “{query}”
            </h2>
            <PostList dictionary={dictionary} locale={locale} posts={results.posts} />
          </>
        ) : (
          <EmptyState
            description={`${dictionary.search.noResultsDescription} “${query}”.`}
            title={dictionary.search.noResults}
          />
        )}
      </section>
      {results ? (
        <Pagination
          basePath={localePath(locale, '/search')}
          dictionary={dictionary}
          query={{ q: query }}
          {...results}
        />
      ) : null}
    </Container>
  )
}
