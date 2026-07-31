'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import {
  saveBrowserAnonymousProfile,
  type BrowserAnonymousProfile,
} from './anonymousProfileStorage'

type Profile = BrowserAnonymousProfile
type Props = {
  labels: {
    avatarLabel: string
    cancel: string
    editProfile: string
    nameLabel: string
    profileStoredLocally: string
    saveProfile: string
  }
  onSave: (profile: Profile) => void
  profile: Profile
  trigger?: ReactNode
}
const avatars = [
  { icon: '🪐', key: 'orbit' },
  { icon: '🤖', key: 'pixel' },
  { icon: '✨', key: 'spark' },
  { icon: '🌊', key: 'wave' },
] as const

export function avatarFor(key: string | null): string {
  return avatars.find((avatar) => avatar.key === key)?.icon ?? '👤'
}

export function AnonymousProfileDialog({ labels, onSave, profile, trigger }: Props) {
  const [avatarKey, setAvatarKey] = useState(profile.avatarKey ?? 'orbit')
  const [displayName, setDisplayName] = useState(profile.displayName ?? '')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open) dialog.current?.showModal()
    else dialog.current?.close()
  }, [open])
  async function save(): Promise<void> {
    setSaving(true)
    try {
      const nextProfile = {
        avatarKey,
        displayName: displayName.trim(),
        shortIdentityCode: profile.shortIdentityCode,
      }
      saveBrowserAnonymousProfile(nextProfile)
      onSave(nextProfile)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }
  return (
    <>
      <button
        className="rounded-control px-3 py-2 text-sm font-bold text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        onClick={() => setOpen(true)}
        type="button"
      >
        {trigger ?? labels.editProfile}
      </button>
      <dialog
        aria-label={labels.editProfile}
        className="w-[min(92vw,30rem)] rounded-2xl border border-border bg-surface p-0 shadow-2xl backdrop:bg-slate-950/25"
        onClose={() => setOpen(false)}
        ref={dialog}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-extrabold">{labels.editProfile}</h3>
            <button
              aria-label={labels.cancel}
              className="rounded p-1 text-text-secondary hover:bg-brand-soft"
              onClick={() => setOpen(false)}
              type="button"
            >
              ×
            </button>
          </div>
          <label className="mt-5 grid gap-2 text-sm font-bold">
            <span>{labels.nameLabel}</span>
            <input
              className="rounded-control border border-border-strong px-3 py-2 focus:border-brand focus:outline-none"
              maxLength={40}
              minLength={2}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              value={displayName}
            />
          </label>
          <fieldset className="mt-5">
            <legend className="text-sm font-bold">{labels.avatarLabel}</legend>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {avatars.map((avatar) => (
                <button
                  aria-label={labels.avatarLabel}
                  aria-pressed={avatar.key === avatarKey}
                  className={`min-h-12 rounded-xl border text-2xl ${avatar.key === avatarKey ? 'border-brand bg-brand-soft' : 'border-border hover:border-brand'}`}
                  key={avatar.key}
                  onClick={() => setAvatarKey(avatar.key)}
                  type="button"
                >
                  {avatar.icon}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="mt-5 text-sm text-text-secondary">{labels.profileStoredLocally}</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-border p-4">
          <button
            className="rounded-control border border-border-strong px-4 py-2 font-bold"
            onClick={() => setOpen(false)}
            type="button"
          >
            {labels.cancel}
          </button>
          <button
            className="rounded-control bg-brand px-4 py-2 font-bold text-white disabled:opacity-60"
            disabled={saving || displayName.trim().length < 2}
            onClick={() => void save()}
            type="button"
          >
            {labels.saveProfile}
          </button>
        </div>
      </dialog>
    </>
  )
}
