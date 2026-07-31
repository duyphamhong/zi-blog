'use client'

import { type FormEvent, useState } from 'react'

import { AnonymousProfileDialog, avatarFor } from './AnonymousProfileDialog'

type Profile = { avatarKey: string | null; displayName: string | null; shortIdentityCode: string }
type PublishedComment = {
  avatarKey: string | null
  content: string
  createdAt: string
  displayName: string
  id: number
}
type Props = {
  labels: {
    avatarLabel: string
    cancel: string
    commentLabel: string
    commentPending: string
    commentPlaceholder: string
    commentSubmitted: string
    commentCount: string
    editProfile: string
    nameLabel: string
    profileAnonymous: string
    profileStoredLocally: string
    saveProfile: string
    commentSubmit: string
  }
  onCommentCreated: (comment: PublishedComment) => void
  onProfileChange: (profile: Profile) => void
  postId: number | string
  profile: Profile
}

export function CommentComposer({
  labels,
  onCommentCreated,
  onProfileChange,
  postId,
  profile,
}: Props) {
  const [content, setContent] = useState('')
  const [failed, setFailed] = useState(false)
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!profile.avatarKey || !profile.displayName || !content.trim()) return
    setFailed(false)
    setPending(true)
    setSubmitted(false)
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        body: JSON.stringify({
          content,
          profile: {
            avatarKey: profile.avatarKey,
            displayName: profile.displayName,
          },
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error()
      const result = (await response.json()) as { comment: PublishedComment }
      onCommentCreated(result.comment)
      setContent('')
      setSubmitted(true)
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }
  return (
    <form
      className="rounded-2xl border border-border bg-gradient-to-br from-surface to-brand-soft/40 p-5 shadow-sm"
      onSubmit={(event) => void submit(event)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-xl"
          >
            {avatarFor(profile.avatarKey)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-extrabold">{profile.displayName ?? labels.nameLabel}</p>
            <p className="text-sm text-text-secondary">
              {labels.profileAnonymous} · {profile.shortIdentityCode}
            </p>
          </div>
        </div>
        <AnonymousProfileDialog labels={labels} onSave={onProfileChange} profile={profile} />
      </div>
      <label className="mt-5 grid gap-2">
        <span className="sr-only">{labels.commentLabel}</span>
        <textarea
          className="min-h-28 resize-y rounded-xl border border-border-strong bg-surface p-4 text-sm leading-6 outline-none transition placeholder:text-text-secondary focus:border-brand focus:ring-2 focus:ring-brand-soft"
          maxLength={2000}
          onChange={(event) => setContent(event.target.value)}
          placeholder={labels.commentPlaceholder}
          value={content}
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-text-secondary">
          {content.length} / 2000 {labels.commentCount}
        </p>
        <button
          className="min-h-11 rounded-control bg-brand px-5 font-extrabold text-white shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!profile.avatarKey || !profile.displayName || !content.trim() || pending}
          type="submit"
        >
          {labels.commentSubmit}
        </button>
      </div>
      <p className="mt-4 text-sm text-text-secondary">{labels.commentPending}</p>
      {submitted ? (
        <p className="mt-3 text-sm font-semibold text-brand" role="status">
          {labels.commentSubmitted}
        </p>
      ) : null}
      {failed ? (
        <p className="mt-3 text-sm font-semibold text-red-700" role="status">
          {labels.commentPending}
        </p>
      ) : null}
    </form>
  )
}
