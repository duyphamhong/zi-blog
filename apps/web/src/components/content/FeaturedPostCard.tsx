import Link from 'next/link'

import type { PostSummary } from '@/modules/content'

import { ResponsiveMedia } from './ResponsiveMedia'

export function FeaturedPostCard({ post }: { post: PostSummary }) {
  return (
    <article className="grid overflow-hidden rounded-3xl bg-slate-950 text-white md:grid-cols-2">
      {post.coverImage ? (
        <ResponsiveMedia
          className="h-full min-h-72 w-full object-cover"
          media={post.coverImage}
          priority
        />
      ) : (
        <div className="min-h-72 bg-gradient-to-br from-cyan-500 to-indigo-700" />
      )}
      <div className="flex flex-col justify-center p-8 sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Featured</p>
        <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
          <Link
            className="hover:text-cyan-200 focus-visible:outline-2"
            href={`/posts/${post.slug}`}
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-5 leading-7 text-slate-300">{post.excerpt}</p>
      </div>
    </article>
  )
}
