import Link from 'next/link'

import type { HomepageSeries } from '@/modules/content'
import { localePath, type AppDictionary, type ContentLocale } from '@/modules/platform'

import { TechnicalArtwork } from './TechnicalArtwork'

export function SeriesCard({
  dictionary,
  locale,
  series,
}: {
  dictionary: AppDictionary
  locale: ContentLocale
  series: HomepageSeries
}) {
  return (
    <article className="group grid gap-5 rounded-card border border-border-subtle bg-surface p-5 shadow-card transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover sm:grid-cols-[5rem_1fr] motion-reduce:transition-none">
      <TechnicalArtwork className="aspect-square w-20 rounded-2xl" seed={series.slug} />
      <div className="min-w-0">
        <h3 className="text-lg font-black leading-tight">
          <Link className="hover:text-brand" href={localePath(locale, `/series/${series.slug}`)}>
            {series.title}
          </Link>
        </h3>
        {series.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-text-secondary">
            {series.description}
          </p>
        ) : null}
        <p className="mt-4 text-xs font-bold text-text-muted">
          {series.publishedPostCount} {dictionary.home.postCount}
        </p>
      </div>
    </article>
  )
}
