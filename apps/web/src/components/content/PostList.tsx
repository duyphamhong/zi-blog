import type { PostSummary } from '@/modules/content'

import { PostCard } from './PostCard'

export function PostList({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
