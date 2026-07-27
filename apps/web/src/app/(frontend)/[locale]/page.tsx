import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FeaturedPostCard } from '@/components/content/FeaturedPostCard'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getDictionary, localePath, parseContentLocale } from '@/modules/platform'
import { getHomePageContent } from '@/modules/content'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const route = await params
  const locale = parseContentLocale(route.locale)
  if (!locale) notFound()
  const [content, dictionary] = await Promise.all([
    getHomePageContent(locale),
    getDictionary(locale),
  ])

  return (
    <Container className="py-12 sm:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
          {dictionary.home.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
          {dictionary.home.heading}
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
          {dictionary.home.intro}
        </p>
      </section>

      {content.featured[0] ? (
        <section aria-labelledby="featured-heading" className="mt-14">
          <h2 className="sr-only" id="featured-heading">
            {dictionary.home.featuredPosts}
          </h2>
          <FeaturedPostCard dictionary={dictionary} locale={locale} post={content.featured[0]} />
        </section>
      ) : null}

      {content.categories.length > 0 ? (
        <nav aria-label={dictionary.home.browseCategories} className="mt-10">
          <ul className="flex flex-wrap gap-3">
            {content.categories.map((category) => (
              <li key={category.slug}>
                <Link
                  className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-bold hover:border-cyan-600 hover:text-cyan-700 dark:border-slate-700 dark:hover:text-cyan-300"
                  href={localePath(locale, `/categories/${category.slug}`)}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <section aria-labelledby="latest-heading" className="mt-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
              {dictionary.home.freshIdeas}
            </p>
            <h2 className="mt-2 text-3xl font-black" id="latest-heading">
              {dictionary.home.latestPosts}
            </h2>
          </div>
          <Link
            className="font-bold text-cyan-700 hover:underline dark:text-cyan-300"
            href={localePath(locale, '/posts')}
          >
            {dictionary.home.viewAll}
          </Link>
        </div>
        {content.latest.posts.length > 0 ? (
          <PostList dictionary={dictionary} locale={locale} posts={content.latest.posts} />
        ) : (
          <EmptyState description={dictionary.home.noPosts} />
        )}
      </section>
    </Container>
  )
}
