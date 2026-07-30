'use client'

import { useEffect, useState } from 'react'

import { AnonymousProfileDialog, avatarFor } from './AnonymousProfileDialog'
import { ANONYMOUS_PROFILE_UPDATED_EVENT } from '@/modules/identity/anonymous/constants'

type Profile = { avatarKey: string | null; displayName: string | null; shortIdentityCode: string }
type Props = {
  labels: {
    avatarLabel: string
    cancel: string
    editProfile: string
    nameLabel: string
    profileMenu: string
    profileStoredLocally: string
    saveProfile: string
  }
}

export function AnonymousProfileMenu({ labels }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  useEffect(() => {
    void fetch('/api/community/profile')
      .then(async (response) => (response.ok ? (response.json() as Promise<Profile>) : null))
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [])
  if (!profile) return null
  function handleSave(nextProfile: Profile): void {
    setProfile(nextProfile)
    window.dispatchEvent(
      new CustomEvent<Profile>(ANONYMOUS_PROFILE_UPDATED_EVENT, { detail: nextProfile }),
    )
  }
  return (
    <AnonymousProfileDialog
      labels={labels}
      onSave={handleSave}
      profile={profile}
      trigger={
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-full bg-brand-soft text-base"
          >
            {avatarFor(profile.avatarKey)}
          </span>
          <span className="hidden max-w-24 truncate sm:inline">
            {profile.displayName ?? labels.profileMenu}
          </span>
        </span>
      }
    />
  )
}
