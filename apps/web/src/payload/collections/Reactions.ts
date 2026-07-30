import type { CollectionConfig } from 'payload'

import { isActiveStaff } from '@/modules/identity'
import { REACTION_TYPES } from '@/modules/community'

export const Reactions: CollectionConfig = {
  slug: 'reactions', labels: { plural: { en: 'Reactions', vi: 'Phản ứng' }, singular: { en: 'Reaction', vi: 'Phản ứng' } },
  access: { admin: ({ req }) => isActiveStaff(req.user), create: () => false, delete: () => false, read: ({ req }) => isActiveStaff(req.user), update: () => false },
  admin: { defaultColumns: ['targetId', 'reactionType', 'createdAt'] },
  fields: [
    { name: 'targetType', type: 'select', required: true, options: [{ label: 'Post', value: 'post' }] },
    { name: 'targetId', type: 'text', required: true, index: true },
    { name: 'actorType', type: 'select', required: true, options: [{ label: 'Anonymous', value: 'anonymous' }] },
    { name: 'anonymousProfile', type: 'relationship', relationTo: 'anonymous-profiles', required: true, index: true },
    { name: 'reactionType', type: 'select', required: true, options: REACTION_TYPES.map((value) => ({ label: value, value })), index: true },
    { name: 'uniquenessKey', type: 'text', required: true, unique: true, index: true },
  ], timestamps: true,
}
