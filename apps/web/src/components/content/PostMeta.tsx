import Link from 'next/link'

import type { PostSummary } from '@/modules/content'
import { formatDate, localePath, type AppDictionary, type ContentLocale } from '@/modules/platform'

export function PostMeta({
  dictionary,
  locale,
  post,
}: {
  dictionary: AppDictionary
  locale: ContentLocale
  post: Pick<PostSummary, 'author' | 'publishedAt' | 'readingTimeMinutes'>
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
      <span
        aria-hidden="true"
        className="inline-flex size-5 items-center justify-center rounded-full bg-brand text-[0.6rem] font-black text-white"
      >
        Z
      </span>
      <span>
        {dictionary.common.by}{' '}
        <Link
          className="font-bold text-text-secondary hover:text-brand hover:underline"
          href={localePath(locale, `/authors/${post.author.username}`)}
        >
          {post.author.displayName}
        </Link>
      </span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
      <span aria-hidden="true">·</span>
      <span>
        {post.readingTimeMinutes} {dictionary.post.minRead}
      </span>
    </p>
  )
}
