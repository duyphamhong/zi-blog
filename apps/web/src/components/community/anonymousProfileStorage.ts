import {
  ANONYMOUS_AVATAR_KEYS,
  ANONYMOUS_PROFILE_UPDATED_EVENT,
} from '@/modules/identity/anonymous/constants'

const ANONYMOUS_PROFILE_STORAGE_KEY = 'zi-blog-anonymous-profile'

export type BrowserAnonymousProfile = {
  avatarKey: string | null
  displayName: string | null
  shortIdentityCode: string
}

function generateIdentityCode(): string {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 4).toUpperCase()
}

export function getBrowserAnonymousProfile(): BrowserAnonymousProfile {
  const stored = window.localStorage.getItem(ANONYMOUS_PROFILE_STORAGE_KEY)
  if (stored) {
    try {
      const value: unknown = JSON.parse(stored)
      if (
        value &&
        typeof value === 'object' &&
        'shortIdentityCode' in value &&
        typeof value.shortIdentityCode === 'string' &&
        'displayName' in value &&
        (typeof value.displayName === 'string' || value.displayName === null) &&
        'avatarKey' in value &&
        (typeof value.avatarKey === 'string' || value.avatarKey === null)
      )
        return {
          avatarKey: value.avatarKey,
          displayName: value.displayName,
          shortIdentityCode: value.shortIdentityCode,
        }
    } catch {
      /* A malformed local value is replaced below. */
    }
  }
  const profile = { avatarKey: null, displayName: null, shortIdentityCode: generateIdentityCode() }
  window.localStorage.setItem(ANONYMOUS_PROFILE_STORAGE_KEY, JSON.stringify(profile))
  return profile
}

export function saveBrowserAnonymousProfile(profile: BrowserAnonymousProfile): void {
  if (
    profile.avatarKey !== null &&
    !(ANONYMOUS_AVATAR_KEYS as readonly string[]).includes(profile.avatarKey)
  )
    return
  window.localStorage.setItem(ANONYMOUS_PROFILE_STORAGE_KEY, JSON.stringify(profile))
  window.dispatchEvent(
    new CustomEvent<BrowserAnonymousProfile>(ANONYMOUS_PROFILE_UPDATED_EVENT, { detail: profile }),
  )
}
