import Link from 'next/link'

import type { PostSummary } from '@/modules/content'
import { formatPublicationDate } from '@/shared/formatting/date'

import { ResponsiveMedia } from './ResponsiveMedia'
import { TaxonomyLinks } from './TaxonomyLinks'

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900">
      {post.coverImage ? (
        <Link href={`/posts/${post.slug}`} tabIndex={-1}>
          <ResponsiveMedia className="aspect-[16/9] w-full object-cover" media={post.coverImage} />
        </Link>
      ) : null}
      <div className="space-y-4 p-6">
        <TaxonomyLinks category={post.category} tags={post.tags.slice(0, 2)} />
        <h2 className="text-xl font-extrabold leading-tight">
          <Link
            className="hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-cyan-600 dark:hover:text-cyan-300"
            href={`/posts/${post.slug}`}
          >
            {post.title}
          </Link>
        </h2>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {post.excerpt}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          By{' '}
          <Link className="font-semibold hover:underline" href={`/authors/${post.author.username}`}>
            {post.author.displayName}
          </Link>{' '}
          · {formatPublicationDate(post.publishedAt)} · {post.readingTimeMinutes} min read
        </p>
      </div>
    </article>
  )
}
