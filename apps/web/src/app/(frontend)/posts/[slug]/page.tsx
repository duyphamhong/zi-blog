import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AuthorSummary } from '@/components/content/AuthorSummary'
import { ResponsiveMedia } from '@/components/content/ResponsiveMedia'
import { RichTextRenderer } from '@/components/content/RichTextRenderer'
import { TaxonomyLinks } from '@/components/content/TaxonomyLinks'
import { Container } from '@/components/layout/Container'
import { getPostsBySeriesSlug, getPublishedPostBySlug } from '@/modules/content'
import { getPublicSiteSettings } from '@/modules/platform'
import { buildPostMetadata } from '@/modules/seo'
import { formatPublicationDate } from '@/shared/formatting/date'

type RouteProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const [post, settings] = await Promise.all([
    getPublishedPostBySlug(slug),
    getPublicSiteSettings(),
  ])
  return post ? buildPostMetadata(post, settings) : {}
}

export default async function PostPage({ params }: RouteProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)
  if (!post) notFound()

  const seriesPosts = post.series
    ? await getPostsBySeriesSlug({ limit: 100, slug: post.series.slug })
    : null
  const currentIndex = seriesPosts?.posts.findIndex((item) => item.slug === post.slug) ?? -1
  const previous = currentIndex > 0 ? seriesPosts?.posts[currentIndex - 1] : null
  const next = seriesPosts && currentIndex >= 0 ? seriesPosts.posts[currentIndex + 1] : null
  const settings = await getPublicSiteSettings()
  const canonical = post.seo?.canonicalUrl || `${settings.siteUrl}/posts/${post.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    author: { '@type': 'Person', name: post.author.displayName },
    datePublished: post.publishedAt,
    description: post.excerpt,
    headline: post.title,
    image: post.coverImage?.url,
    mainEntityOfPage: canonical,
  }

  return (
    <Container className="py-12">
      <article className="mx-auto max-w-4xl">
        <TaxonomyLinks category={post.category} tags={post.tags} />
        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">{post.title}</h1>
        <p className="mt-6 text-xl leading-8 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          {formatPublicationDate(post.publishedAt)} · {post.readingTimeMinutes} min read
          {post.visibility === 'unlisted' ? ' · Unlisted' : ''}
        </p>
        {post.coverImage ? (
          <ResponsiveMedia
            className="mt-10 aspect-[16/9] w-full rounded-2xl object-cover"
            media={post.coverImage}
            priority
          />
        ) : null}
        {post.series ? (
          <p className="mt-8 rounded-lg bg-cyan-50 p-4 text-sm dark:bg-cyan-950">
            Part {post.seriesOrder} of{' '}
            <Link className="font-bold underline" href={`/series/${post.series.slug}`}>
              {post.series.title}
            </Link>
          </p>
        ) : null}
        <div className="mt-10">
          <RichTextRenderer content={post.content} />
        </div>
        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <a
            className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`}
          >
            Share on LinkedIn
          </a>
          <a
            className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            href={`https://x.com/intent/post?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(post.title)}`}
          >
            Share on X
          </a>
        </div>
        <div className="mt-12">
          <AuthorSummary author={post.author} />
        </div>
        {previous || next ? (
          <nav aria-label="Series navigation" className="mt-10 grid gap-4 sm:grid-cols-2">
            {previous ? (
              <Link
                className="rounded-xl border p-4 hover:border-cyan-600"
                href={`/posts/${previous.slug}`}
              >
                <span className="block text-xs uppercase text-slate-500">Previous in series</span>
                <span className="mt-1 block font-bold">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                className="rounded-xl border p-4 text-right hover:border-cyan-600"
                href={`/posts/${next.slug}`}
              >
                <span className="block text-xs uppercase text-slate-500">Next in series</span>
                <span className="mt-1 block font-bold">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </article>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        type="application/ld+json"
      />
    </Container>
  )
}
