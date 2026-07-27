import type { PublicAuthor } from '@/modules/content'

import { ResponsiveMedia } from './ResponsiveMedia'

export function AuthorSummary({ author }: { author: PublicAuthor }) {
  return (
    <section className="flex items-start gap-5 rounded-2xl bg-slate-100 p-6 dark:bg-slate-900">
      {author.avatar ? (
        <ResponsiveMedia className="h-16 w-16 rounded-full object-cover" media={author.avatar} />
      ) : (
        <div
          aria-hidden="true"
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-cyan-700 text-xl font-black text-white"
        >
          {author.displayName.charAt(0)}
        </div>
      )}
      <div>
        <h2 className="font-extrabold">{author.displayName}</h2>
        {author.bio ? (
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{author.bio}</p>
        ) : null}
        {author.expertise.length > 0 ? (
          <p className="mt-3 text-xs font-semibold text-cyan-800 dark:text-cyan-300">
            {author.expertise.join(' · ')}
          </p>
        ) : null}
      </div>
    </section>
  )
}
