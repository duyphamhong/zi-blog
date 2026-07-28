import type { PostSummary } from '@/modules/content'
import type { AppDictionary, ContentLocale } from '@/modules/platform'

import { PostCard } from './PostCard'

export function PostList({
  dictionary,
  headingLevel = 2,
  locale,
  posts,
}: {
  dictionary: AppDictionary
  headingLevel?: 2 | 3
  locale: ContentLocale
  posts: PostSummary[]
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard
          dictionary={dictionary}
          headingLevel={headingLevel}
          key={post.slug}
          locale={locale}
          post={post}
        />
      ))}
    </div>
  )
}
