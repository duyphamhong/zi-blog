'use client'

import { useEffect, useState } from 'react'

type Reaction = 'like' | 'dislike' | null
type Props = {
  postId: number | string
  labels: { activeLike: string; dislike: string; like: string; reactionError: string }
}
type Counts = { dislikes: number; likes: number }

const initialCounts: Counts = { dislikes: 0, likes: 0 }

export function PostReactionButtons({ labels, postId }: Props) {
  const [counts, setCounts] = useState<Counts>(initialCounts)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const route = `/api/community/posts/${postId}/reaction`

  useEffect(() => {
    void fetch(route)
      .then(async (response) =>
        response.ok
          ? (response.json() as Promise<{ counts: Counts; reaction: Reaction }>)
          : Promise.reject(),
      )
      .then((value) => {
        setCounts(value.counts)
      })
      .catch(() => setError(labels.reactionError))
  }, [labels.reactionError, route])

  async function change(next: Exclude<Reaction, null>): Promise<void> {
    if (pending) return
    const previousCounts = counts
    const nextCounts = {
      dislikes: counts.dislikes + (next === 'dislike' ? 1 : 0),
      likes: counts.likes + (next === 'like' ? 1 : 0),
    }
    setError('')
    setPending(true)
    setCounts(nextCounts)
    try {
      const response = await fetch(route, {
        body: JSON.stringify({ reactionType: next }),
        headers: { 'content-type': 'application/json' },
        method: 'PUT',
      })
      if (!response.ok) throw new Error()
      const value = (await response.json()) as { counts: Counts; reaction: Reaction }
      setCounts(value.counts)
    } catch {
      setCounts(previousCounts)
      setError(labels.reactionError)
    } finally {
      setPending(false)
    }
  }

  const buttonClass = (active: boolean) =>
    `inline-flex min-h-11 items-center justify-center gap-2 rounded-control border px-4 text-sm font-bold transition motion-reduce:transition-none ${active ? 'border-brand bg-brand-soft text-brand' : 'border-border-strong bg-surface text-text-primary hover:border-brand hover:bg-brand-soft'} ${pending ? 'cursor-wait opacity-70' : 'active:scale-[0.98]'}`

  return (
    <div className="flex flex-1 flex-wrap gap-3">
      <button
        aria-label={`${labels.like}: ${counts.likes}`}
        aria-pressed={false}
        className={buttonClass(false)}
        disabled={pending}
        onClick={() => void change('like')}
        type="button"
      >
        <span aria-hidden="true">👍</span>
        {labels.like}
        <span>{counts.likes}</span>
      </button>
      <button
        aria-label={`${labels.dislike}: ${counts.dislikes}`}
        aria-pressed={false}
        className={buttonClass(false)}
        disabled={pending}
        onClick={() => void change('dislike')}
        type="button"
      >
        <span aria-hidden="true">👎</span>
        {labels.dislike}
        <span>{counts.dislikes}</span>
      </button>
      {error ? (
        <p className="basis-full text-sm text-red-700" role="status">
          {error}
        </p>
      ) : null}
    </div>
  )
}
