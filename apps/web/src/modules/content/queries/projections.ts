import type { Category, Media, Post, Series, Tag, User } from '@/payload-types'

import type {
  PostDetail,
  PostSummary,
  PublicAuthor,
  PublicMedia,
  PublicSeries,
  PublicTaxonomy,
} from './types'

type PostSummarySource = Pick<
  Post,
  | 'author'
  | 'category'
  | 'coverImage'
  | 'excerpt'
  | 'featured'
  | 'publishedAt'
  | 'readingTimeMinutes'
  | 'series'
  | 'seriesOrder'
  | 'slug'
  | 'tags'
  | 'title'
  | 'id'
>

function isPopulated<T extends { id: number }>(value: number | null | T | undefined): value is T {
  return Boolean(value && typeof value === 'object')
}

export function projectMedia(value: Media | number | null | undefined): PublicMedia | null {
  if (!isPopulated(value) || !value.url || !value.alt) return null
  return {
    alt: value.alt,
    height: value.height,
    url: value.url,
    width: value.width,
  }
}

export function projectAuthor(value: User | number): PublicAuthor {
  if (!isPopulated(value)) {
    throw new Error('Public post queries must populate their author relationship')
  }
  return {
    avatar: projectMedia(value.avatar),
    bio: value.bio,
    displayName: value.displayName,
    expertise: value.expertise?.map(({ topic }) => topic) ?? [],
    socialLinks: value.socialLinks,
    username: value.username,
  }
}

export function projectCategory(value: Category | number): PublicTaxonomy {
  if (!isPopulated(value)) {
    throw new Error('Public post queries must populate their category relationship')
  }
  return {
    description: value.description,
    name: value.name,
    slug: value.slug,
  }
}

export function projectTag(value: Tag | number): PublicTaxonomy {
  if (!isPopulated(value)) {
    throw new Error('Public post queries must populate tag relationships')
  }
  return {
    description: value.description,
    name: value.name,
    slug: value.slug,
  }
}

export function projectSeries(value: Series | number | null | undefined): PublicSeries | null {
  if (!isPopulated(value)) return null
  return {
    description: value.description,
    slug: value.slug,
    title: value.title,
  }
}

export function projectPostSummary(post: PostSummarySource): PostSummary {
  if (!post.publishedAt) throw new Error(`Published post "${post.slug}" has no publishedAt`)
  return {
    id: post.id,
    author: projectAuthor(post.author),
    category: projectCategory(post.category),
    coverImage: projectMedia(post.coverImage),
    excerpt: post.excerpt,
    featured: Boolean(post.featured),
    publishedAt: post.publishedAt,
    readingTimeMinutes: post.readingTimeMinutes ?? 1,
    series: projectSeries(post.series),
    seriesOrder: post.seriesOrder,
    slug: post.slug,
    tags: post.tags?.map(projectTag) ?? [],
    title: post.title,
  }
}

export function projectPostDetail(post: Post): PostDetail {
  return {
    ...projectPostSummary(post),
    content: post.content,
    seo: post.seo,
    visibility: post.visibility,
  }
}
