import type { PublicAuthor } from '@/modules/content'

import { ResponsiveMedia } from './ResponsiveMedia'

export function AuthorSummary({ author }: { author: PublicAuthor }) {
  return (
    <section className="flex items-start gap-5 rounded-card border border-border-subtle bg-surface p-6 shadow-card">
      {author.avatar ? (
        <ResponsiveMedia className="h-16 w-16 rounded-full object-cover" media={author.avatar} />
      ) : (
        <div
          aria-hidden="true"
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand text-xl font-black text-white"
        >
          {author.displayName.charAt(0)}
        </div>
      )}
      <div>
        <h2 className="font-extrabold">{author.displayName}</h2>
        {author.bio ? (
          <p className="mt-2 text-sm leading-6 text-text-secondary">{author.bio}</p>
        ) : null}
        {author.expertise.length > 0 ? (
          <p className="mt-3 text-xs font-semibold text-brand">{author.expertise.join(' · ')}</p>
        ) : null}
      </div>
    </section>
  )
}
