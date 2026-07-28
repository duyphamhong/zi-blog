import Link from 'next/link'

import type { PostSummary } from '@/modules/content'
import { localePath, type AppDictionary, type ContentLocale } from '@/modules/platform'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { Badge } from '@/components/ui/Badge'

import { PostCover } from './PostCover'
import { PostMeta } from './PostMeta'

export function FeaturedPostCard({
  dictionary,
  locale,
  post,
}: {
  dictionary: AppDictionary
  locale: ContentLocale
  post: PostSummary
}) {
  return (
    <article className="grid overflow-hidden rounded-card border border-border-subtle bg-surface shadow-card md:grid-cols-[0.92fr_1.08fr]">
      <PostCover
        className="h-full min-h-64 w-full object-cover md:min-h-80"
        post={post}
        priority
        sizes="(max-width: 767px) 100vw, 45vw"
      />
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{dictionary.common.featured}</Badge>
          <Badge tone="neutral">{post.category.name}</Badge>
        </div>
        <h2 className="zi-text-balance mt-5 text-2xl font-black leading-tight sm:text-3xl">
          <Link
            className="transition hover:text-brand motion-reduce:transition-none"
            href={localePath(locale, `/posts/${post.slug}`)}
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 line-clamp-3 leading-7 text-text-secondary">{post.excerpt}</p>
        <div className="mt-6 flex items-end justify-between gap-5">
          <PostMeta dictionary={dictionary} locale={locale} post={post} />
          <Link
            aria-label={post.title}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-hover hover:translate-x-0.5 motion-reduce:transition-none"
            href={localePath(locale, `/posts/${post.slug}`)}
          >
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </article>
  )
}
