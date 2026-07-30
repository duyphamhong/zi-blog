import { createHmac, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'

import { env } from '@/config/env'
import { getPayloadClient } from '@/shared/payload/client'

import {
  ANONYMOUS_COOKIE_MAX_AGE_SECONDS,
  ANONYMOUS_COOKIE_NAME,
  ANONYMOUS_PROFILE_COLLECTION,
} from './constants'

export type AnonymousActor = {
  profileId: number
  status: 'active' | 'restricted' | 'blocked'
  displayName: string | null
  avatarKey: string | null
  shortIdentityCode: string
}

function hashToken(token: string): string {
  return createHmac('sha256', env.PAYLOAD_SECRET).update(token).digest('hex')
}

function createToken(): string {
  return randomBytes(32).toString('base64url')
}

export async function resolveAnonymousActor(): Promise<AnonymousActor> {
  const cookieStore = await cookies()
  let token = cookieStore.get(ANONYMOUS_COOKIE_NAME)?.value
  if (!token) {
    token = createToken()
    cookieStore.set(ANONYMOUS_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: ANONYMOUS_COOKIE_MAX_AGE_SECONDS,
      path: '/',
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
    })
  }
  const payload = await getPayloadClient()
  const tokenHash = hashToken(token)
  const existing = await payload.find({
    collection: ANONYMOUS_PROFILE_COLLECTION,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { anonymousIdHash: { equals: tokenHash } },
  })
  const profile =
    existing.docs[0] ??
    (await payload.create({
      collection: ANONYMOUS_PROFILE_COLLECTION,
      data: {
        anonymousIdHash: tokenHash,
        shortIdentityCode: randomBytes(2).toString('hex').toUpperCase(),
        status: 'active',
      },
      overrideAccess: true,
    }))
  await payload.update({
    collection: ANONYMOUS_PROFILE_COLLECTION,
    id: profile.id,
    data: { lastActiveAt: new Date().toISOString() },
    overrideAccess: true,
  })
  return {
    profileId: profile.id,
    status: profile.status as AnonymousActor['status'],
    displayName: profile.displayName ?? null,
    avatarKey: profile.avatarKey ?? null,
    shortIdentityCode: profile.shortIdentityCode,
  }
}
