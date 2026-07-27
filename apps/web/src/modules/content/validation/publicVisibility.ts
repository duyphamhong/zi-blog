export type PublicationState = {
  _status?: 'draft' | 'published' | null
  visibility?: 'public' | 'unlisted' | null
  seo?: {
    noIndex?: boolean | null
  } | null
}

export function isPublicFeedPost(post: PublicationState): boolean {
  return post._status === 'published' && post.visibility === 'public'
}

export function isDirectlyAccessiblePost(post: PublicationState): boolean {
  return (
    post._status === 'published' && (post.visibility === 'public' || post.visibility === 'unlisted')
  )
}

export function isIndexablePost(post: PublicationState): boolean {
  return isPublicFeedPost(post) && post.seo?.noIndex !== true
}
