'use client'

import { useEffect, useState } from 'react'

import { avatarFor } from './AnonymousProfileDialog'
import { CommentComposer } from './CommentComposer'
import { ANONYMOUS_PROFILE_UPDATED_EVENT } from '@/modules/identity/anonymous/constants'
import { getBrowserAnonymousProfile, type BrowserAnonymousProfile } from './anonymousProfileStorage'

type Comment = {
  avatarKey: string | null
  content: string
  createdAt: string
  displayName: string
  id: number
}
type Profile = BrowserAnonymousProfile
type Props = {
  postId: number | string
  labels: {
    avatarLabel: string
    beFirstComment: string
    cancel: string
    commentCount: string
    commentLabel: string
    commentPending: string
    commentPlaceholder: string
    commentSubmitted: string
    commentsEmpty: string
    commentsError: string
    commentsHeading: string
    editProfile: string
    nameLabel: string
    newest: string
    profileAnonymous: string
    profileStoredLocally: string
    saveProfile: string
    commentSubmit: string
  }
}

export function CommentSection({ labels, postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [failed, setFailed] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  useEffect(() => {
    void fetch(`/api/community/posts/${postId}/comments`)
      .then(async (response) =>
        response.ok ? (response.json() as Promise<{ comments: Comment[] }>) : Promise.reject(),
      )
      .then((value) => setComments(value.comments))
      .catch(() => setFailed(true))
    queueMicrotask(() => setProfile(getBrowserAnonymousProfile()))
  }, [postId])
  useEffect(() => {
    const updateProfile = (event: Event) => {
      const value = event instanceof CustomEvent ? event.detail : null
      if (
        !value ||
        typeof value !== 'object' ||
        !('shortIdentityCode' in value) ||
        typeof value.shortIdentityCode !== 'string' ||
        !('displayName' in value) ||
        (typeof value.displayName !== 'string' && value.displayName !== null) ||
        !('avatarKey' in value) ||
        (typeof value.avatarKey !== 'string' && value.avatarKey !== null)
      )
        return
      setProfile({
        avatarKey: value.avatarKey,
        displayName: value.displayName,
        shortIdentityCode: value.shortIdentityCode,
      })
    }
    window.addEventListener(ANONYMOUS_PROFILE_UPDATED_EVENT, updateProfile)
    return () => window.removeEventListener(ANONYMOUS_PROFILE_UPDATED_EVENT, updateProfile)
  }, [])
  return (
    <section className="mt-12" aria-labelledby="comments-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black tracking-tight text-text-primary" id="comments-heading">
          {labels.commentsHeading} ({comments.length})
        </h2>
        <button
          className="min-h-10 rounded-control border border-border bg-surface px-3 text-sm font-bold text-text-secondary"
          type="button"
        >
          {labels.newest}⌄
        </button>
      </div>
      {profile ? (
        <div className="mt-5">
          <CommentComposer
            labels={{
              avatarLabel: labels.avatarLabel,
              cancel: labels.cancel,
              commentCount: labels.commentCount,
              commentLabel: labels.commentLabel,
              commentPending: labels.commentPending,
              commentPlaceholder: labels.commentPlaceholder,
              commentSubmitted: labels.commentSubmitted,
              commentSubmit: labels.commentSubmit,
              editProfile: labels.editProfile,
              nameLabel: labels.nameLabel,
              profileAnonymous: labels.profileAnonymous,
              profileStoredLocally: labels.profileStoredLocally,
              saveProfile: labels.saveProfile,
            }}
            onCommentCreated={(comment) => setComments((current) => [...current, comment])}
            onProfileChange={setProfile}
            postId={postId}
            profile={profile}
          />
        </div>
      ) : null}
      {failed ? (
        <p
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="status"
        >
          {labels.commentsError}
        </p>
      ) : null}
      {comments.length === 0 && !failed ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border-strong bg-surface p-6 text-center">
          <p className="font-bold text-text-primary">{labels.commentsEmpty}</p>
          <p className="mt-1 text-sm text-text-secondary">{labels.beFirstComment}</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4">
          {comments.map((comment) => (
            <li
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
              key={comment.id}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-lg"
                >
                  {avatarFor(comment.avatarKey)}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{comment.displayName}</strong>
                    <span className="rounded bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand">
                      {labels.profileAnonymous}
                    </span>
                  </div>
                  <time
                    className="mt-1 block text-xs text-text-secondary"
                    dateTime={comment.createdAt}
                  >
                    {new Intl.DateTimeFormat().format(new Date(comment.createdAt))}
                  </time>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap leading-7 text-text-primary">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
