import Link from 'next/link'

import type { PostSummary } from '@/modules/content'
import { localePath, type AppDictionary, type ContentLocale } from '@/modules/platform'

import { PostCover } from './PostCover'
import { PostMeta } from './PostMeta'
import { TaxonomyLinks } from './TaxonomyLinks'

export function PostCard({
  dictionary,
  headingLevel = 2,
  locale,
  post,
}: {
  dictionary: AppDictionary
  headingLevel?: 2 | 3
  locale: ContentLocale
  post: PostSummary
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border-subtle bg-surface shadow-card transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover motion-reduce:transition-none">
      <Link href={localePath(locale, `/posts/${post.slug}`)} tabIndex={-1}>
        <PostCover
          className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
          post={post}
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <TaxonomyLinks category={post.category} locale={locale} tags={post.tags.slice(0, 2)} />
        <Heading className="zi-text-balance text-xl font-black leading-tight">
          <Link
            className="transition hover:text-brand motion-reduce:transition-none"
            href={localePath(locale, `/posts/${post.slug}`)}
          >
            {post.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-sm leading-6 text-text-secondary">{post.excerpt}</p>
        <div className="mt-auto pt-1">
          <PostMeta dictionary={dictionary} locale={locale} post={post} />
        </div>
      </div>
    </article>
  )
}
