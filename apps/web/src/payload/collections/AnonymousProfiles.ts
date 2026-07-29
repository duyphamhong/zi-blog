import type { CollectionConfig } from 'payload'

import { isActiveStaff, superAdminOnly } from '@/modules/identity'
import { ANONYMOUS_AVATAR_KEYS, ANONYMOUS_PROFILE_STATUS } from '@/modules/identity/anonymous'

export const AnonymousProfiles: CollectionConfig = {
  slug: 'anonymous-profiles', labels: { plural: { en: 'Anonymous profiles', vi: 'Hồ sơ ẩn danh' }, singular: { en: 'Anonymous profile', vi: 'Hồ sơ ẩn danh' } },
  access: { admin: ({ req }) => isActiveStaff(req.user), create: superAdminOnly, delete: superAdminOnly, read: ({ req }) => isActiveStaff(req.user), update: ({ req }) => isActiveStaff(req.user) },
  admin: { defaultColumns: ['displayName', 'status', 'lastActiveAt', 'createdAt'], useAsTitle: 'shortIdentityCode' },
  fields: [
    { name: 'anonymousIdHash', type: 'text', unique: true, index: true, required: true, admin: { hidden: true } },
    { name: 'displayName', type: 'text' },
    { name: 'avatarKey', type: 'select', options: ANONYMOUS_AVATAR_KEYS.map((value) => ({ label: value, value })) },
    { name: 'status', type: 'select', defaultValue: 'active', index: true, required: true, options: ANONYMOUS_PROFILE_STATUS.map((value) => ({ label: value, value })) },
    { name: 'shortIdentityCode', type: 'text', required: true }, { name: 'lastActiveAt', type: 'date', index: true },
  ], timestamps: true,
}
