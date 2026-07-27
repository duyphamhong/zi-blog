import { unstable_cache } from 'next/cache'
import type { Where } from 'payload'

import { env } from '@/config/env'
import { cacheTags } from '@/modules/platform/cache/tags'
import { getPayloadClient } from '@/shared/payload/client'

import {
  projectCategory,
  projectPostDetail,
  projectPostSummary,
  projectSeries,
  projectTag,
} from './projections'
import type { PaginatedPosts, PostDetail, PostSummary, PublicSeries, PublicTaxonomy } from './types'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

const postSummarySelect = {
  author: true,
  category: true,
  coverImage: true,
  excerpt: true,
  featured: true,
  publishedAt: true,
  readingTimeMinutes: true,
  series: true,
  seriesOrder: true,
  slug: true,
  tags: true,
  title: true,
} as const

const publicFeedWhere: Where = {
  and: [{ _status: { equals: 'published' } }, { visibility: { equals: 'public' } }],
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback
}

function pageSize(value: number | undefined): number {
  return Math.min(positiveInteger(value, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
}

async function findPostPage(input: {
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
    limit: pageSize(input.limit),
    overrideAccess: true,
    page: positiveInteger(input.page, 1),
    pagination: true,
    select: postSummarySelect,
    sort: input.sort ?? '-publishedAt',
    where: input.where
      ? {
          and: [publicFeedWhere, input.where],
        }
      : publicFeedWhere,
  })

  return {
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    page: result.page ?? 1,
    posts: result.docs.map(projectPostSummary),
    totalPages: result.totalPages,
  }
}

export async function getLatestPosts(
  input: {
    limit?: number
    page?: number
  } = {},
): Promise<PaginatedPosts> {
  return getLatestPostsCached(input)
}

const getLatestPostsCached = unstable_cache(
  (input: { limit?: number; page?: number }) => findPostPage(input),
  ['latest-posts'],
  { revalidate: 300, tags: [cacheTags.posts] },
)

export async function getFeaturedPosts(input: { limit?: number } = {}): Promise<PostSummary[]> {
  return getFeaturedPostsCached(input)
}

const getFeaturedPostsCached = unstable_cache(
  async (input: { limit?: number }) => {
    const page = await findPostPage({
      limit: input.limit ?? 3,
      where: { featured: { equals: true } },
    })
    return page.posts
  },
  ['featured-posts'],
  { revalidate: 300, tags: [cacheTags.posts] },
)

async function queryHomePageContent(): Promise<{
  categories: { name: string; slug: string }[]
  featured: PostSummary[]
  latest: PaginatedPosts
}> {
  const payload = await getPayloadClient()
  const [featured, latest, categories] = await Promise.all([
    getFeaturedPosts({ limit: 3 }),
    getLatestPosts({ limit: 9 }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 20,
      overrideAccess: true,
      pagination: false,
      sort: ['displayOrder', 'name'],
      where: { isActive: { equals: true } },
    }),
  ])
  return {
    categories: categories.docs.map(({ name, slug }) => ({ name, slug })),
    featured,
    latest,
  }
}

const getHomePageContentCached = unstable_cache(queryHomePageContent, ['home-page-content'], {
  revalidate: 300,
  tags: [cacheTags.posts, cacheTags.categories],
})

export async function getHomePageContent(): ReturnType<typeof queryHomePageContent> {
  return getHomePageContentCached()
}

async function queryPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft: false,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
        { visibility: { in: ['public', 'unlisted'] } },
      ],
    },
  })
  const post = result.docs[0]
  return post ? projectPostDetail(post) : null
}

const getPublishedPostBySlugCached = unstable_cache(
  queryPublishedPostBySlug,
  ['published-post-by-slug'],
  { revalidate: 3600, tags: [cacheTags.posts] },
)

export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
  return env.NODE_ENV === 'test'
    ? queryPublishedPostBySlug(slug)
    : getPublishedPostBySlugCached(slug)
}

export async function getPostsByCategorySlug(input: {
  slug: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  return getPostsByCategorySlugCached(input)
}

const getPostsByCategorySlugCached = unstable_cache(
  (input: { slug: string; limit?: number; page?: number }) =>
    findPostPage({
      ...input,
      where: { 'category.slug': { equals: input.slug } },
    }),
  ['posts-by-category'],
  { revalidate: 300, tags: [cacheTags.posts, cacheTags.categories] },
)

async function queryPublicCategoryBySlug(slug: string): Promise<PublicTaxonomy | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, { isActive: { equals: true } }],
    },
  })
  return result.docs[0] ? projectCategory(result.docs[0]) : null
}

const getPublicCategoryBySlugCached = unstable_cache(
  queryPublicCategoryBySlug,
  ['public-category-by-slug'],
  { revalidate: 300, tags: [cacheTags.categories] },
)

export async function getPublicCategoryBySlug(slug: string): Promise<PublicTaxonomy | null> {
  return getPublicCategoryBySlugCached(slug)
}

export async function getPostsByTagSlug(input: {
  slug: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  return getPostsByTagSlugCached(input)
}

const getPostsByTagSlugCached = unstable_cache(
  (input: { slug: string; limit?: number; page?: number }) =>
    findPostPage({
      ...input,
      where: { 'tags.slug': { equals: input.slug } },
    }),
  ['posts-by-tag'],
  { revalidate: 300, tags: [cacheTags.posts, cacheTags.tags] },
)

async function queryPublicTagBySlug(slug: string): Promise<PublicTaxonomy | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'tags',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] ? projectTag(result.docs[0]) : null
}

const getPublicTagBySlugCached = unstable_cache(queryPublicTagBySlug, ['public-tag-by-slug'], {
  revalidate: 300,
  tags: [cacheTags.tags],
})

export async function getPublicTagBySlug(slug: string): Promise<PublicTaxonomy | null> {
  return getPublicTagBySlugCached(slug)
}

export async function getPostsByAuthorUsername(input: {
  username: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  return getPostsByAuthorUsernameCached(input)
}

const getPostsByAuthorUsernameCached = unstable_cache(
  (input: { username: string; limit?: number; page?: number }) =>
    findPostPage({
      limit: input.limit,
      page: input.page,
      where: { 'author.username': { equals: input.username } },
    }),
  ['posts-by-author'],
  { revalidate: 300, tags: [cacheTags.posts, cacheTags.users] },
)

async function querySeriesBySlug(slug: string): Promise<PublicSeries | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'series',
    depth: 1,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, { isActive: { equals: true } }],
    },
  })
  return projectSeries(result.docs[0])
}

const getSeriesBySlugCached = unstable_cache(querySeriesBySlug, ['series-by-slug'], {
  revalidate: 300,
  tags: [cacheTags.series],
})

export async function getSeriesBySlug(slug: string): Promise<PublicSeries | null> {
  return getSeriesBySlugCached(slug)
}

export async function getPostsBySeriesSlug(input: {
  slug: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  return getPostsBySeriesSlugCached(input)
}

const getPostsBySeriesSlugCached = unstable_cache(
  (input: { slug: string; limit?: number; page?: number }) =>
    findPostPage({
      ...input,
      sort: ['seriesOrder', 'publishedAt'],
      where: { 'series.slug': { equals: input.slug } },
    }),
  ['posts-by-series'],
  { revalidate: 300, tags: [cacheTags.posts, cacheTags.series] },
)

/*
 * Search deliberately bypasses shared caching. It is request-specific, length-limited,
 * parameterized by Payload, and restricted to the public publication boundary.
 */
export async function searchPublishedPosts(input: {
  query: string
  limit?: number
  page?: number
}): Promise<PaginatedPosts> {
  const query = input.query
    .replace(/[^\p{L}\p{N}\s._-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (query.length < 2 || query.length > 100) {
    return { hasNextPage: false, hasPrevPage: false, page: 1, posts: [], totalPages: 0 }
  }
  return findPostPage({
    limit: input.limit,
    page: input.page,
    where: {
      or: [{ title: { contains: query } }, { excerpt: { contains: query } }],
    },
  })
}

async function queryPublishedPostsForSitemap(): Promise<PostSummary[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft: false,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: postSummarySelect,
    sort: '-updatedAt',
    where: {
      and: [publicFeedWhere, { 'seo.noIndex': { not_equals: true } }],
    },
  })
  return result.docs.map(projectPostSummary)
}

const getPublishedPostsForSitemapCached = unstable_cache(
  queryPublishedPostsForSitemap,
  ['posts-for-sitemap'],
  { revalidate: 300, tags: [cacheTags.posts] },
)

export async function getPublishedPostsForSitemap(): Promise<PostSummary[]> {
  return env.NODE_ENV === 'test'
    ? queryPublishedPostsForSitemap()
    : getPublishedPostsForSitemapCached()
}

const getPublishedPostsForRssCached = unstable_cache(
  async () => {
    const result = await findPostPage({ limit: 50 })
    return result.posts
  },
  ['posts-for-rss'],
  { revalidate: 300, tags: [cacheTags.posts] },
)

export async function getPublishedPostsForRss(): Promise<PostSummary[]> {
  return getPublishedPostsForRssCached()
}
