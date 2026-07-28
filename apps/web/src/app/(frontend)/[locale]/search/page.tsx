import { notFound } from 'next/navigation'

import { Pagination } from '@/components/content/Pagination'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { SearchIcon } from '@/components/ui/Icons'
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
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">
        {dictionary.navigation.search}
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
        {dictionary.search.title}
      </h1>
      <form
        action={localePath(locale, '/search')}
        className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row"
        role="search"
      >
        <label className="sr-only" htmlFor="search-query">
          {dictionary.search.label}
        </label>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="min-h-12 w-full rounded-control border border-border-strong bg-surface pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
            defaultValue={query}
            id="search-query"
            maxLength={100}
            minLength={2}
            name="q"
            placeholder={dictionary.search.placeholder}
            required
            type="search"
          />
        </div>
        <Button type="submit">{dictionary.search.button}</Button>
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
