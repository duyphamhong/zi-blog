import { notFound } from 'next/navigation'

import { FeaturedPostCard } from '@/components/content/FeaturedPostCard'
import { HomeHero } from '@/components/content/HomeHero'
import { PostList } from '@/components/content/PostList'
import { SeriesCard } from '@/components/content/SeriesCard'
import { TopicNavigation } from '@/components/content/TopicNavigation'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { BookIcon, LightningIcon } from '@/components/ui/Icons'
import { SectionHeading } from '@/components/ui/SectionHeading'
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
  const firstSeries = content.featuredSeries[0]

  return (
    <Container>
      <HomeHero
        description={content.hero.description}
        dictionary={dictionary}
        locale={locale}
        seriesHref={firstSeries ? localePath(locale, `/series/${firstSeries.slug}`) : undefined}
      />

      {content.featuredPost ? (
        <section aria-labelledby="featured-heading" className="mt-2">
          <h2 className="sr-only" id="featured-heading">
            {dictionary.home.featuredPosts}
          </h2>
          <FeaturedPostCard dictionary={dictionary} locale={locale} post={content.featuredPost} />
        </section>
      ) : null}

      <div className="mt-8">
        <TopicNavigation dictionary={dictionary} locale={locale} topics={content.featuredTopics} />
      </div>

      <section aria-labelledby="latest-heading" className="mt-14">
        <SectionHeading
          action={dictionary.home.viewAll}
          eyebrow={dictionary.home.freshIdeas}
          href={localePath(locale, '/posts')}
          icon={<LightningIcon className="text-brand" />}
          id="latest-heading"
          title={dictionary.home.latestPosts}
        />
        {content.latestPosts.length > 0 ? (
          <PostList
            dictionary={dictionary}
            headingLevel={3}
            locale={locale}
            posts={content.latestPosts}
          />
        ) : (
          <EmptyState description={dictionary.home.noPosts} />
        )}
      </section>

      {content.featuredSeries.length > 0 ? (
        <section aria-labelledby="series-heading" className="mt-16">
          <SectionHeading
            eyebrow={dictionary.home.seriesDescription}
            icon={<BookIcon className="text-brand" />}
            id="series-heading"
            title={dictionary.home.series}
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {content.featuredSeries.map((series) => (
              <SeriesCard dictionary={dictionary} key={series.id} locale={locale} series={series} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  )
}
