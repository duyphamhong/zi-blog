import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AuthorSummary } from '@/components/content/AuthorSummary'
import { ResponsiveMedia } from '@/components/content/ResponsiveMedia'
import { RichTextRenderer } from '@/components/content/RichTextRenderer'
import { TaxonomyLinks } from '@/components/content/TaxonomyLinks'
import { ArticleViewTracker } from '@/components/analytics/ArticleViewTracker'
import { PostReactions } from '@/components/community/PostReactions'
import { CommentSection } from '@/components/community/CommentSection'
import { ShareActions } from '@/components/community/ShareActions'
import { Container } from '@/components/layout/Container'
import {
  getAlternatePostUrls,
  getPostsBySeriesSlug,
  getPublishedPostBySlug,
} from '@/modules/content'
import {
  formatDate,
  getDictionary,
  getPublicSiteSettings,
  getPublicCommunityFeatures,
  localePath,
  parseContentLocale,
} from '@/modules/platform'
import { buildPostMetadata } from '@/modules/seo'

type RouteProps = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const route = await params
  const locale = parseContentLocale(route.locale)
  if (!locale) return {}
  const post = await getPublishedPostBySlug({ locale, slug: route.slug })
  if (!post) return {}
  const [settings, alternateUrls] = await Promise.all([
    getPublicSiteSettings(locale),
    getAlternatePostUrls(post.id),
  ])
  return buildPostMetadata({ alternateUrls, locale, post, settings })
}

export default async function PostPage({ params }: RouteProps) {
  const route = await params
  const locale = parseContentLocale(route.locale)
  if (!locale) notFound()
  const post = await getPublishedPostBySlug({ locale, slug: route.slug })
  if (!post) notFound()

  const [dictionary, settings, seriesPosts, communityFeatures] = await Promise.all([
    getDictionary(locale),
    getPublicSiteSettings(locale),
    post.series ? getPostsBySeriesSlug({ limit: 100, locale, slug: post.series.slug }) : null,
    getPublicCommunityFeatures(),
  ])
  const currentIndex = seriesPosts?.posts.findIndex((item) => item.slug === post.slug) ?? -1
  const previous = currentIndex > 0 ? seriesPosts?.posts[currentIndex - 1] : null
  const next = seriesPosts && currentIndex >= 0 ? seriesPosts.posts[currentIndex + 1] : null
  const canonical =
    post.seo?.canonicalUrl ||
    new URL(localePath(locale, `/posts/${post.slug}`), settings.siteUrl).toString()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    author: { '@type': 'Person', name: post.author.displayName },
    datePublished: post.publishedAt,
    description: post.excerpt,
    headline: post.title,
    image: post.coverImage?.url,
    inLanguage: locale,
    mainEntityOfPage: canonical,
  }

  return (
    <Container className="py-12">
      <article className="mx-auto max-w-4xl">
        <TaxonomyLinks category={post.category} locale={locale} tags={post.tags} />
        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">{post.title}</h1>
        <p className="mt-6 text-xl leading-8 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          {formatDate(post.publishedAt, locale)} · {post.readingTimeMinutes}{' '}
          {dictionary.post.minRead}
          {post.visibility === 'unlisted' ? ` · ${dictionary.common.unlisted}` : ''}
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
            {dictionary.post.part} {post.seriesOrder}{' '}
            <Link
              className="font-bold underline"
              href={localePath(locale, `/series/${post.series.slug}`)}
            >
              {post.series.title}
            </Link>
          </p>
        ) : null}
        <div className="mt-10">
          <RichTextRenderer content={post.content} locale={locale} />
        </div>
        {communityFeatures.postReactions ? <PostReactions labels={dictionary.post} postId={post.id} /> : null}
        {communityFeatures.shareTracking ? <ShareActions canonicalUrl={canonical} linkedInLabel={dictionary.post.shareLinkedIn} postId={post.id} title={post.title} xLabel={dictionary.post.shareX} /> : null}
        {communityFeatures.articleViewTracking ? <ArticleViewTracker postId={post.id} /> : null}
        {communityFeatures.comments ? <CommentSection labels={{ empty: dictionary.post.commentsEmpty, error: dictionary.post.commentsError, heading: dictionary.post.commentsHeading }} postId={post.id} /> : null}
        <div className="mt-12">
          <AuthorSummary author={post.author} />
        </div>
        {previous || next ? (
          <nav aria-label={dictionary.common.series} className="mt-10 grid gap-4 sm:grid-cols-2">
            {previous ? (
              <Link
                className="rounded-xl border p-4 hover:border-cyan-600"
                href={localePath(locale, `/posts/${previous.slug}`)}
              >
                <span className="block text-xs uppercase text-slate-500">
                  {dictionary.post.previousInSeries}
                </span>
                <span className="mt-1 block font-bold">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                className="rounded-xl border p-4 text-right hover:border-cyan-600"
                href={localePath(locale, `/posts/${next.slug}`)}
              >
                <span className="block text-xs uppercase text-slate-500">
                  {dictionary.post.nextInSeries}
                </span>
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
