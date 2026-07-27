import type { PostSummary } from '@/modules/content'
import type { AppDictionary, ContentLocale } from '@/modules/platform'

import { PostCard } from './PostCard'

export function PostList({
  dictionary,
  locale,
  posts,
}: {
  dictionary: AppDictionary
  locale: ContentLocale
  posts: PostSummary[]
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard dictionary={dictionary} key={post.slug} locale={locale} post={post} />
      ))}
    </div>
  )
}
