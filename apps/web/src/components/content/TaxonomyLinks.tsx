import Link from 'next/link'

import type { PublicTaxonomy } from '@/modules/content'
import { localePath, type ContentLocale } from '@/modules/platform'

export function TaxonomyLinks({
  category,
  tags,
  locale,
}: {
  category: PublicTaxonomy
  locale: ContentLocale
  tags: PublicTaxonomy[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        className="rounded-md bg-brand-soft px-2.5 py-1 text-[0.6875rem] font-black uppercase tracking-[0.08em] text-brand transition hover:bg-brand-soft-strong motion-reduce:transition-none"
        href={localePath(locale, `/categories/${category.slug}`)}
      >
        {category.name}
      </Link>
      {tags.map((tag) => (
        <Link
          className="rounded-md bg-canvas-subtle px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-text-muted transition hover:bg-brand-soft hover:text-brand motion-reduce:transition-none"
          href={localePath(locale, `/tags/${tag.slug}`)}
          key={tag.slug}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  )
}
