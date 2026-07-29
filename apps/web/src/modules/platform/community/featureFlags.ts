import { unstable_cache } from 'next/cache'

import { getPayloadClient } from '@/shared/payload/client'

import {
  COMMUNITY_DEFAULTS,
  COMMUNITY_SETTINGS_CACHE_TAG,
  COMMUNITY_SETTINGS_SLUG,
} from './constants'

export type PublicCommunityFeatures = {
  anonymousProfiles: boolean
  articleViewTracking: boolean
  comments: boolean
  postReactions: boolean
  shareTracking: boolean
}

export function projectPublicCommunityFeatures(value: object): PublicCommunityFeatures {
  const settings = value as Partial<Record<string, unknown>>
  return {
    anonymousProfiles:
      typeof settings.anonymousProfilesEnabled === 'boolean'
        ? settings.anonymousProfilesEnabled
        : COMMUNITY_DEFAULTS.anonymousProfilesEnabled,
    articleViewTracking:
      typeof settings.articleViewTrackingEnabled === 'boolean'
        ? settings.articleViewTrackingEnabled
        : COMMUNITY_DEFAULTS.articleViewTrackingEnabled,
    comments:
      typeof settings.commentsEnabled === 'boolean'
        ? settings.commentsEnabled
        : COMMUNITY_DEFAULTS.commentsEnabled,
    postReactions:
      typeof settings.postReactionsEnabled === 'boolean'
        ? settings.postReactionsEnabled
        : COMMUNITY_DEFAULTS.postReactionsEnabled,
    shareTracking:
      typeof settings.shareTrackingEnabled === 'boolean'
        ? settings.shareTrackingEnabled
        : COMMUNITY_DEFAULTS.shareTrackingEnabled,
  }
}

async function queryPublicCommunityFeatures(): Promise<PublicCommunityFeatures> {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({
    slug: COMMUNITY_SETTINGS_SLUG,
    depth: 0,
    overrideAccess: true,
  })
  return projectPublicCommunityFeatures(settings)
}

const getPublicCommunityFeaturesCached = unstable_cache(
  queryPublicCommunityFeatures,
  ['public-community-features'],
  { revalidate: 300, tags: [COMMUNITY_SETTINGS_CACHE_TAG] },
)

export function getPublicCommunityFeatures(): Promise<PublicCommunityFeatures> {
  return process.env.NODE_ENV === 'test'
    ? queryPublicCommunityFeatures()
    : getPublicCommunityFeaturesCached()
}
