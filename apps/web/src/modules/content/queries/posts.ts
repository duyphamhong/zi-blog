import { unstable_cache } from 'next/cache'
import type { Where } from 'payload'

import { env } from '@/config/env'
import { getActor } from '@/modules/identity'
import {
  CONTENT_LOCALES,
  cacheTags,
  getPublicSiteSettings,
  localizedPostPath,
  type ContentLocale,
} from '@/modules/platform'
import { searchLocalizedDocuments } from '@/modules/search'
import { getPayloadClient } from '@/shared/payload/client'

import {
  projectCategory,
  projectPostDetail,
  projectPostSummary,
  projectSeries,
  projectTag,
} from './projections'
import type {
  HomepageContent,
  LocalizedUrls,
  PaginatedPosts,
  PostDetail,
  PostSummary,
  PublicSeries,
  PublicTaxonomy,
} from './types'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

const postSummarySelect = {
  author: true,
  category: true,
  coverImage: true,
  excerpt: true,
  featured: true,
  id: true,
  publishedAt: true,
  readingTimeMinutes: true,
  series: true,
  seriesOrder: true,
  slug: true,
  tags: true,
  title: true,
} as const

const publicFeedWhere: Where = {
  and: [
    { _status: { equals: 'published' } },
    { visibility: { equals: 'public' } },
    { title: { exists: true } },
    { slug: { exists: true } },
    { excerpt: { exists: true } },
    { content: { exists: true } },
  ],
}

function relationIdentifier(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  const id = value.id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback
}

function pageSize(value: number | undefined): number {
  return Math.min(positiveInteger(value, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
}

async function findPostPage(input: {
  locale: ContentLocale
  page?: number
  limit?: number
  where?: Where
  sort?: string | string[]
}): Promise<PaginatedPosts> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft: false,
    fallbackLocale: false,
    limit: pageSize(input.limit),
    locale: input.locale,
    overrideAccess: true,
    page: positiveInteger(input.page, 1),
    pagination: true,
    select: postSummarySelect,
    sort: input.sort ?? '-publishedAt',
    where: input.where ? { and: [publicFeedWhere, input.where] } : publicFeedWhere,
  })

  return {
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    page: result.page ?? 1,
    posts: result.docs.map(projectPostSummary),
    totalPages: result.totalPages,
  }
}

export function getLatestPosts(input: {
  locale: ContentLocale
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  return unstable_cache(
    () => findPostPage(input),
    [
      'latest-posts',
      input.locale,
      String(input.page ?? 1),
      String(input.limit ?? DEFAULT_PAGE_SIZE),
    ],
    {
      revalidate: 300,
      tags: [cacheTags.locale.feed(input.locale)],
    },
  )()
}

export function getFeaturedPosts(input: {
  locale: ContentLocale
  limit?: number
}): Promise<PostSummary[]> {
  return unstable_cache(
    async () =>
      (
        await findPostPage({
          ...input,
          limit: input.limit ?? 3,
          where: { featured: { equals: true } },
        })
      ).posts,
    ['featured-posts', input.locale, String(input.limit ?? 3)],
    {
      revalidate: 300,
      tags: [cacheTags.locale.feed(input.locale)],
    },
  )()
}

async function queryHomePageContent(locale: ContentLocale): Promise<HomepageContent> {
  const payload = await getPayloadClient()
  const [featured, latest, categories, series, seriesPosts, settings] = await Promise.all([
    findPostPage({
      limit: 1,
      locale,
      where: { featured: { equals: true } },
    }),
    findPostPage({ limit: 6, locale }),
    payload.find({
      collection: 'categories',
      depth: 0,
      fallbackLocale: false,
      limit: 6,
      locale,
      overrideAccess: true,
      pagination: false,
      sort: ['displayOrder', 'name'],
      where: {
        and: [
          { isActive: { equals: true } },
          { name: { exists: true } },
          { slug: { exists: true } },
        ],
      },
    }),
    payload.find({
      collection: 'series',
      depth: 1,
      fallbackLocale: false,
      limit: 3,
      locale,
      overrideAccess: true,
      pagination: false,
      select: {
        coverImage: true,
        description: true,
        id: true,
        slug: true,
        title: true,
      },
      sort: '-updatedAt',
      where: {
        and: [
          { isActive: { equals: true } },
          { title: { exists: true } },
          { slug: { exists: true } },
        ],
      },
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      draft: false,
      fallbackLocale: false,
      limit: 200,
      locale,
      overrideAccess: true,
      pagination: false,
      select: {
        id: true,
        series: true,
      },
      where: {
        and: [publicFeedWhere, { series: { exists: true } }],
      },
    }),
    getPublicSiteSettings(locale),
  ])

  const seriesPostCounts = new Map<number | string, number>()
  for (const post of seriesPosts.docs) {
    const seriesId = relationIdentifier(post.series)
    if (seriesId === null) continue
    seriesPostCounts.set(seriesId, (seriesPostCounts.get(seriesId) ?? 0) + 1)
  }

  return {
    featuredPost: featured.posts[0] ?? null,
    featuredSeries: series.docs.flatMap((entry) => {
      const projected = projectSeries(entry)
      return projected
        ? [{ ...projected, publishedPostCount: seriesPostCounts.get(projected.id) ?? 0 }]
        : []
    }),
    featuredTopics: categories.docs.map(projectCategory),
    hero: {
      description: settings.siteDescription,
      siteName: settings.siteName,
    },
    latestPosts: latest.posts,
    popularPosts: [],
  }
}

export function getHomePageContent(locale: ContentLocale): ReturnType<typeof queryHomePageContent> {
  return env.NODE_ENV === 'test'
    ? queryHomePageContent(locale)
    : unstable_cache(() => queryHomePageContent(locale), ['home-page', locale], {
        revalidate: 300,
        tags: [cacheTags.locale.feed(locale)],
      })()
}

async function queryPublishedPostBySlug(
  locale: ContentLocale,
  slug: string,
): Promise<PostDetail | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft: false,
    fallbackLocale: false,
    limit: 1,
    locale,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
        { visibility: { in: ['public', 'unlisted'] } },
        { title: { exists: true } },
        { excerpt: { exists: true } },
        { content: { exists: true } },
      ],
    },
  })
  const post = result.docs[0]
  return post ? projectPostDetail(post) : null
}

export function getPublishedPostBySlug(input: {
  locale: ContentLocale
  slug: string
}): Promise<PostDetail | null> {
  return env.NODE_ENV === 'test'
    ? queryPublishedPostBySlug(input.locale, input.slug)
    : unstable_cache(
        () => queryPublishedPostBySlug(input.locale, input.slug),
        ['published-post', input.locale, input.slug],
        {
          revalidate: 3600,
          tags: [cacheTags.locale.postSlug(input.locale, input.slug)],
        },
      )()
}

export async function getAuthorizedDraftPost(input: {
  headers: Headers
  id: number
  locale: ContentLocale
}): Promise<PostDetail | null> {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: input.headers })
  const actor = getActor(user)
  if (!actor || actor.status === 'disabled') return null

  const post = await payload.findByID({
    collection: 'posts',
    depth: 2,
    draft: true,
    fallbackLocale: false,
    id: input.id,
    locale: input.locale,
    overrideAccess: true,
  })
  if (actor.role === 'author' && String(relationIdentifier(post.author)) !== String(actor.id)) {
    return null
  }
  return post.title && post.slug && post.excerpt && post.content
    ? projectPostDetail({ ...post, publishedAt: post.publishedAt ?? post.updatedAt })
    : null
}

export async function getAlternatePostUrls(postId: number): Promise<LocalizedUrls> {
  const payload = await getPayloadClient()
  const entries = await Promise.all(
    CONTENT_LOCALES.map(async (locale) => {
      const post = await payload.findByID({
        collection: 'posts',
        depth: 0,
        draft: false,
        fallbackLocale: false,
        id: postId,
        locale,
        overrideAccess: true,
      })
      return post._status === 'published' &&
        (post.visibility === 'public' || post.visibility === 'unlisted') &&
        post.title &&
        post.slug &&
        post.excerpt &&
        post.content
        ? ([locale, localizedPostPath(locale, post.slug)] as const)
        : null
    }),
  )
  return Object.fromEntries(entries.filter((entry) => entry !== null)) as LocalizedUrls
}

export function getPostsByCategorySlug(input: {
  locale: ContentLocale
  slug: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  return findPostPage({ ...input, where: { 'category.slug': { equals: input.slug } } })
}

export async function getPublicCategoryBySlug(input: {
  locale: ContentLocale
  slug: string
}): Promise<PublicTaxonomy | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    fallbackLocale: false,
    limit: 1,
    locale: input.locale,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { slug: { equals: input.slug } },
        { isActive: { equals: true } },
        { name: { exists: true } },
      ],
    },
  })
  return result.docs[0] ? projectCategory(result.docs[0]) : null
}

export function getPostsByTagSlug(input: {
  locale: ContentLocale
  slug: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  return findPostPage({ ...input, where: { 'tags.slug': { equals: input.slug } } })
}

export async function getPublicTagBySlug(input: {
  locale: ContentLocale
  slug: string
}): Promise<PublicTaxonomy | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'tags',
    depth: 0,
    fallbackLocale: false,
    limit: 1,
    locale: input.locale,
    overrideAccess: true,
    pagination: false,
    where: { and: [{ slug: { equals: input.slug } }, { name: { exists: true } }] },
  })
  return result.docs[0] ? projectTag(result.docs[0]) : null
}

export function getPostsByAuthorUsername(input: {
  locale: ContentLocale
  username: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  return findPostPage({
    limit: input.limit,
    locale: input.locale,
    page: input.page,
    where: { 'author.username': { equals: input.username } },
  })
}

export async function getSeriesBySlug(input: {
  locale: ContentLocale
  slug: string
}): Promise<PublicSeries | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'series',
    depth: 1,
    fallbackLocale: false,
    limit: 1,
    locale: input.locale,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { slug: { equals: input.slug } },
        { isActive: { equals: true } },
        { title: { exists: true } },
      ],
    },
  })
  return projectSeries(result.docs[0])
}

export function getPostsBySeriesSlug(input: {
  locale: ContentLocale
  slug: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  return findPostPage({
    ...input,
    sort: ['seriesOrder', 'publishedAt'],
    where: { 'series.slug': { equals: input.slug } },
  })
}

export async function searchPublishedPosts(input: {
  locale: ContentLocale
  query: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  const payload = await getPayloadClient()
  const limit = pageSize(input.limit)
  const page = positiveInteger(input.page, 1)
  const result = await searchLocalizedDocuments({
    limit,
    locale: input.locale,
    page,
    payload,
    query: input.query,
  })
  const posts = (
    await Promise.all(
      result.docs.map((document) =>
        getPublishedPostBySlug({ locale: input.locale, slug: document.slug }),
      ),
    )
  ).filter((post): post is PostDetail => post !== null)
  return {
    hasNextPage: page < result.totalPages,
    hasPrevPage: page > 1,
    page,
    posts,
    totalPages: result.totalPages,
  }
}

async function queryPublishedPostsForSitemap(locale: ContentLocale): Promise<PostSummary[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft: false,
    fallbackLocale: false,
    limit: 1000,
    locale,
    overrideAccess: true,
    pagination: false,
    select: postSummarySelect,
    sort: '-updatedAt',
    where: { and: [publicFeedWhere, { 'seo.noIndex': { not_equals: true } }] },
  })
  return result.docs.map(projectPostSummary)
}

export function getPublishedPostsForSitemap(locale: ContentLocale): Promise<PostSummary[]> {
  return queryPublishedPostsForSitemap(locale)
}

export async function getPublishedPostsForRss(locale: ContentLocale): Promise<PostSummary[]> {
  return (await findPostPage({ limit: 50, locale })).posts
}
