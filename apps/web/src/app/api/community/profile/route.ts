import { NextResponse } from 'next/server'

import { ANONYMOUS_AVATAR_KEYS, resolveAnonymousActor } from '@/modules/identity/anonymous'
import { COMMUNITY_LIMITS, getPublicCommunityFeatures } from '@/modules/platform/community'
import { getPayloadClient } from '@/shared/payload/client'

const INVALID_PROFILE_RESPONSE = { error: 'invalid_profile' }
const FEATURE_DISABLED_RESPONSE = { error: 'feature_disabled' }

export async function GET(): Promise<NextResponse> {
  const features = await getPublicCommunityFeatures()
  if (!features.anonymousProfiles) return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 403 })
  const actor = await resolveAnonymousActor()
  return NextResponse.json({ avatarKey: actor.avatarKey, displayName: actor.displayName, status: actor.status })
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const features = await getPublicCommunityFeatures()
  if (!features.anonymousProfiles) return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 403 })
  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json(INVALID_PROFILE_RESPONSE, { status: 400 })
  const displayName = 'displayName' in body && typeof body.displayName === 'string' ? body.displayName.replace(/\s+/g, ' ').trim() : ''
  const avatarCandidate = 'avatarKey' in body && typeof body.avatarKey === 'string' ? body.avatarKey : undefined
  const avatarKey = avatarCandidate && (ANONYMOUS_AVATAR_KEYS as readonly string[]).includes(avatarCandidate) ? avatarCandidate as (typeof ANONYMOUS_AVATAR_KEYS)[number] : undefined
  const validName = displayName.length >= COMMUNITY_LIMITS.displayNameMinLength && displayName.length <= COMMUNITY_LIMITS.displayNameMaxLength && !/[<>]|https?:\/\/|@/.test(displayName)
  const validAvatar = avatarCandidate === undefined || avatarKey !== undefined
  if (!validName || !validAvatar) return NextResponse.json(INVALID_PROFILE_RESPONSE, { status: 400 })
  const actor = await resolveAnonymousActor()
  const payload = await getPayloadClient()
  await payload.update({ collection: 'anonymous-profiles', id: actor.profileId, data: { avatarKey, displayName }, overrideAccess: true })
  return NextResponse.json({ avatarKey: avatarKey ?? actor.avatarKey, displayName })
}
