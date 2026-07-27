import type { Post } from '@/payload-types'

export type PublicMedia = {
  alt: string
  height?: number | null
  url: string
  width?: number | null
}

export type PublicAuthor = {
  avatar?: PublicMedia | null
  bio?: string | null
  displayName: string
  expertise: string[]
  socialLinks?: {
    github?: string | null
    linkedIn?: string | null
    website?: string | null
  }
  username: string
}

export type PublicTaxonomy = {
  description?: string | null
  name: string
  slug: string
}

export type PublicSeries = {
  description?: string | null
  slug: string
  title: string
}

export type PostSummary = {
  author: PublicAuthor
  category: PublicTaxonomy
  coverImage?: PublicMedia | null
  excerpt: string
  featured: boolean
  publishedAt: string
  readingTimeMinutes: number
  series?: PublicSeries | null
  seriesOrder?: number | null
  slug: string
  tags: PublicTaxonomy[]
  title: string
}

export type PostDetail = PostSummary & {
  content: Post['content']
  seo?: Post['seo']
  visibility: 'public' | 'unlisted'
}

export type PaginatedPosts = {
  hasNextPage: boolean
  hasPrevPage: boolean
  page: number
  posts: PostSummary[]
  totalPages: number
}
