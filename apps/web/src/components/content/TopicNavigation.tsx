import Link from 'next/link'

import type { PublicTaxonomy } from '@/modules/content'
import { getCoverArtworkVariant } from '@/modules/content/presentation/coverArtwork'
import { localePath, type AppDictionary, type ContentLocale } from '@/modules/platform'

export function TopicNavigation({
  dictionary,
  locale,
  topics,
}: {
  dictionary: AppDictionary
  locale: ContentLocale
  topics: PublicTaxonomy[]
}) {
  if (!topics.length) return null

  return (
    <nav aria-label={dictionary.home.browseCategories}>
      <ul className="zi-scrollbar-none flex gap-3 overflow-x-auto pb-1">
        {topics.map((topic) => (
          <li className="shrink-0" key={topic.slug}>
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-control border border-border-subtle bg-surface px-4 text-sm font-extrabold text-text-secondary transition hover:border-brand hover:bg-brand-soft hover:text-brand motion-reduce:transition-none"
              href={localePath(locale, `/categories/${topic.slug}`)}
            >
              <TopicGlyph seed={topic.slug} />
              {topic.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function TopicGlyph({ seed }: { seed: string }) {
  const variant = getCoverArtworkVariant(seed)
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-5 items-center justify-center rounded-md bg-brand-soft text-[0.65rem] font-black text-brand"
    >
      {variant === 'architecture' ? '◇' : variant === 'operations' ? '↗' : '{ }'}
    </span>
  )
}
