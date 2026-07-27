import Link from 'next/link'

import type { PostSummary } from '@/modules/content'
import { formatDate, localePath, type AppDictionary, type ContentLocale } from '@/modules/platform'

import { ResponsiveMedia } from './ResponsiveMedia'
import { TaxonomyLinks } from './TaxonomyLinks'

export function PostCard({
  dictionary,
  locale,
  post,
}: {
  dictionary: AppDictionary
  locale: ContentLocale
  post: PostSummary
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900">
      {post.coverImage ? (
        <Link href={localePath(locale, `/posts/${post.slug}`)} tabIndex={-1}>
          <ResponsiveMedia className="aspect-[16/9] w-full object-cover" media={post.coverImage} />
        </Link>
      ) : null}
      <div className="space-y-4 p-6">
        <TaxonomyLinks category={post.category} locale={locale} tags={post.tags.slice(0, 2)} />
        <h2 className="text-xl font-extrabold leading-tight">
          <Link
            className="hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-cyan-600 dark:hover:text-cyan-300"
            href={localePath(locale, `/posts/${post.slug}`)}
          >
            {post.title}
          </Link>
        </h2>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {post.excerpt}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {dictionary.common.by}{' '}
          <Link
            className="font-semibold hover:underline"
            href={localePath(locale, `/authors/${post.author.username}`)}
          >
            {post.author.displayName}
          </Link>{' '}
          · {formatDate(post.publishedAt, locale)} · {post.readingTimeMinutes}{' '}
          {dictionary.post.minRead}
        </p>
      </div>
    </article>
  )
}
