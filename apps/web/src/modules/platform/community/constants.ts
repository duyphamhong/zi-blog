export const COMMUNITY_SETTINGS_SLUG = 'community-settings'
export const COMMUNITY_SETTINGS_CACHE_TAG = 'community-settings'
export const COMMUNITY_DEFAULTS = {
  anonymousProfilesEnabled: true,
  articleViewTrackingEnabled: true,
  commentsEnabled: false,
  postReactionsEnabled: true,
  shareTrackingEnabled: true,
} as const
export const COMMUNITY_LIMITS = {
  commentMaxLength: 2000,
  commentReplyDepthLimit: 1,
  displayNameMaxLength: 40,
  displayNameMinLength: 2,
} as const
