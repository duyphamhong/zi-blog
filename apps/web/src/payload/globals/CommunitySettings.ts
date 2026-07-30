import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { editorOrSuperAdmin, isActiveStaff } from '@/modules/identity'
import {
  COMMUNITY_DEFAULTS,
  COMMUNITY_LIMITS,
  COMMUNITY_SETTINGS_CACHE_TAG,
} from '@/modules/platform/community'

export const CommunitySettings: GlobalConfig = {
  slug: 'community-settings',
  label: { en: 'Community settings', vi: 'Cài đặt cộng đồng' },
  access: { read: ({ req }) => isActiveStaff(req.user), update: editorOrSuperAdmin },
  fields: [
    { name: 'anonymousProfilesEnabled', type: 'checkbox', defaultValue: COMMUNITY_DEFAULTS.anonymousProfilesEnabled },
    { name: 'postReactionsEnabled', type: 'checkbox', defaultValue: COMMUNITY_DEFAULTS.postReactionsEnabled },
    { name: 'commentsEnabled', type: 'checkbox', defaultValue: COMMUNITY_DEFAULTS.commentsEnabled },
    { name: 'shareTrackingEnabled', type: 'checkbox', defaultValue: COMMUNITY_DEFAULTS.shareTrackingEnabled },
    { name: 'articleViewTrackingEnabled', type: 'checkbox', defaultValue: COMMUNITY_DEFAULTS.articleViewTrackingEnabled },
    { name: 'anonymousDisplayNameMinLength', type: 'number', defaultValue: COMMUNITY_LIMITS.displayNameMinLength, min: 2, max: 40 },
    { name: 'anonymousDisplayNameMaxLength', type: 'number', defaultValue: COMMUNITY_LIMITS.displayNameMaxLength, min: 2, max: 80 },
    { name: 'commentMaxLength', type: 'number', defaultValue: COMMUNITY_LIMITS.commentMaxLength, min: 1, max: 10000 },
    { name: 'commentReplyDepthLimit', type: 'number', defaultValue: COMMUNITY_LIMITS.commentReplyDepthLimit, min: 0, max: 3 },
  ],
  hooks: { afterChange: [({ doc, req }) => { if (!req.pathname?.startsWith('/admin/')) revalidateTag(COMMUNITY_SETTINGS_CACHE_TAG, 'max'); return doc }] },
}
