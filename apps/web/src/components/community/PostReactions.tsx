'use client'

import { useEffect, useState } from 'react'

type Reaction = 'like' | 'dislike' | null
type Props = { postId: number | string; labels: { dislike: string; like: string; reactionError: string } }

export function PostReactions({ labels, postId }: Props) {
  const [reaction, setReaction] = useState<Reaction>(null)
  const [counts, setCounts] = useState({ dislikes: 0, likes: 0 })
  const [error, setError] = useState(false)
  const route = `/api/community/posts/${postId}/reaction`
  useEffect(() => { fetch(route).then(async (response) => response.ok ? response.json() as Promise<{ reaction: Reaction; counts: { dislikes: number; likes: number } }> : null).then((value) => { if (value) { setReaction(value.reaction); setCounts(value.counts) } }).catch(() => setError(true)) }, [route])
  async function change(next: Exclude<Reaction, null>) {
    setError(false)
    const response = await fetch(route, { body: JSON.stringify({ reactionType: next }), headers: { 'content-type': 'application/json' }, method: 'PUT' })
    if (!response.ok) { setError(true); return }
    const value = await response.json() as { reaction: Reaction; counts: { dislikes: number; likes: number } }
    setReaction(value.reaction); setCounts(value.counts)
  }
  return <section aria-label={labels.like} className="mt-10 flex items-center gap-3"><button aria-pressed={reaction === 'like'} className="rounded border px-3 py-2" onClick={() => void change('like')} type="button">{labels.like} ({counts.likes})</button><button aria-pressed={reaction === 'dislike'} className="rounded border px-3 py-2" onClick={() => void change('dislike')} type="button">{labels.dislike} ({counts.dislikes})</button>{error ? <p role="status">{labels.reactionError}</p> : null}</section>
}
