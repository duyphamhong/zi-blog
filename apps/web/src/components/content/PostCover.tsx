import type { PostSummary } from '@/modules/content'

import { ResponsiveMedia } from './ResponsiveMedia'
import { TechnicalArtwork } from './TechnicalArtwork'

export function PostCover({
  className = '',
  post,
  priority = false,
  sizes,
}: {
  className?: string
  post: Pick<PostSummary, 'category' | 'coverImage' | 'slug'>
  priority?: boolean
  sizes: string
}) {
  return post.coverImage ? (
    <ResponsiveMedia
      className={className}
      media={post.coverImage}
      priority={priority}
      sizes={sizes}
    />
  ) : (
    <TechnicalArtwork className={className} seed={`${post.category.slug}-${post.slug}`} />
  )
}
