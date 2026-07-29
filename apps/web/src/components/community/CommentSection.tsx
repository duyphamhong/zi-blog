'use client'

import { type FormEvent, useEffect, useState } from 'react'

type Comment = { content: string; createdAt: string; displayName: string; id: number }
type Profile = { displayName: string | null }
type Props = {
  postId: number | string
  labels: {
    commentLabel: string
    empty: string
    error: string
    heading: string
    nameLabel: string
    pending: string
    submit: string
  }
}

export function CommentSection({ labels, postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [failed, setFailed] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => { void fetch(`/api/community/posts/${postId}/comments`).then(async (response) => response.ok ? response.json() as Promise<{ comments: Comment[] }> : Promise.reject()).then((value) => setComments(value.comments)).catch(() => setFailed(true)) }, [postId])
  useEffect(() => {
    void fetch('/api/community/profile')
      .then(async (response) =>
        response.ok ? (response.json() as Promise<Profile>) : Promise.reject(),
      )
      .then((value) => {
        setProfile(value)
        setDisplayName(value.displayName ?? '')
      })
      .catch(() => setFailed(true))
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSubmitting(true)
    setFailed(false)
    try {
      if (!profile?.displayName) {
        const profileResponse = await fetch('/api/community/profile', {
          body: JSON.stringify({ displayName }),
          headers: { 'content-type': 'application/json' },
          method: 'PATCH',
        })
        if (!profileResponse.ok) throw new Error()
        setProfile(await profileResponse.json() as Profile)
      }
      const commentResponse = await fetch(`/api/community/posts/${postId}/comments`, {
        body: JSON.stringify({ content }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      if (!commentResponse.ok) throw new Error()
      setContent('')
    } catch {
      setFailed(true)
    } finally {
      setSubmitting(false)
    }
  }
  return <section className="mt-12" aria-labelledby="comments-heading"><h2 className="text-2xl font-bold" id="comments-heading">{labels.heading}</h2>{failed ? <p role="status">{labels.error}</p> : null}{comments.length === 0 ? <p>{labels.empty}</p> : <ul>{comments.map((comment) => <li className="mt-4 rounded border p-4" key={comment.id}><strong>{comment.displayName}</strong><p>{comment.content}</p></li>)}</ul>}<form className="mt-6 grid gap-3" onSubmit={(event) => void submit(event)}>{!profile?.displayName ? <label className="grid gap-1"><span>{labels.nameLabel}</span><input className="rounded border px-3 py-2" maxLength={40} minLength={2} onChange={(event) => setDisplayName(event.target.value)} required value={displayName} /></label> : null}<label className="grid gap-1"><span>{labels.commentLabel}</span><textarea className="min-h-28 rounded border px-3 py-2" maxLength={2000} onChange={(event) => setContent(event.target.value)} required value={content} /></label><button className="w-fit rounded bg-cyan-700 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={submitting} type="submit">{labels.submit}</button>{content === '' ? null : <p className="text-sm text-slate-500">{labels.pending}</p>}</form></section>
}
