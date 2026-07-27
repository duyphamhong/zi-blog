import Link from 'next/link'

import { FeaturedPostCard } from '@/components/content/FeaturedPostCard'
import { PostList } from '@/components/content/PostList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getHomePageContent } from '@/modules/content'

export default async function HomePage() {
  const content = await getHomePageContent()

  return (
    <Container className="py-12 sm:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
          Technology, explained
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
          Build better systems with practical engineering stories.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Architecture, tooling, and lessons learned from shipping software.
        </p>
      </section>

      {content.featured[0] ? (
        <section aria-labelledby="featured-heading" className="mt-14">
          <h2 className="sr-only" id="featured-heading">
            Featured posts
          </h2>
          <FeaturedPostCard post={content.featured[0]} />
        </section>
      ) : null}

      {content.categories.length > 0 ? (
        <nav aria-label="Browse categories" className="mt-10">
          <ul className="flex flex-wrap gap-3">
            {content.categories.map((category) => (
              <li key={category.slug}>
                <Link
                  className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-bold hover:border-cyan-600 hover:text-cyan-700 dark:border-slate-700 dark:hover:text-cyan-300"
                  href={`/categories/${category.slug}`}
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
              Fresh ideas
            </p>
            <h2 className="mt-2 text-3xl font-black" id="latest-heading">
              Latest posts
            </h2>
          </div>
          <Link
            className="font-bold text-cyan-700 hover:underline dark:text-cyan-300"
            href="/posts"
          >
            View all
          </Link>
        </div>
        {content.latest.posts.length > 0 ? (
          <PostList posts={content.latest.posts} />
        ) : (
          <EmptyState description="Publish a post in Payload Admin and it will appear here. Drafts stay private." />
        )}
      </section>
    </Container>
  )
}
