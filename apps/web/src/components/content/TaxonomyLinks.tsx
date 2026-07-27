import Link from 'next/link'

import type { PublicTaxonomy } from '@/modules/content'

export function TaxonomyLinks({
  category,
  tags,
}: {
  category: PublicTaxonomy
  tags: PublicTaxonomy[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
      <Link
        className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200"
        href={`/categories/${category.slug}`}
      >
        {category.name}
      </Link>
      {tags.map((tag) => (
        <Link
          className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          href={`/tags/${tag.slug}`}
          key={tag.slug}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  )
}
