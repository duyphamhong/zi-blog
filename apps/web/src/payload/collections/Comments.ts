import type { CollectionConfig } from 'payload'

import { isActiveStaff } from '@/modules/identity'
import { COMMENT_STATUSES } from '@/modules/community'

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: {
    plural: { en: 'Comments', vi: 'Bình luận' },
    singular: { en: 'Comment', vi: 'Bình luận' },
  },
  access: {
    admin: ({ req }) => isActiveStaff(req.user),
    create: () => false,
    delete: () => false,
    read: ({ req }) => isActiveStaff(req.user),
    update: ({ req }) => isActiveStaff(req.user),
  },
  admin: { defaultColumns: ['post', 'authorDisplayNameSnapshot', 'status', 'createdAt'] },
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'posts', required: true, index: true },
    // Retained only to read historic records. New comments store author details as snapshots.
    {
      name: 'anonymousProfile',
      type: 'relationship',
      relationTo: 'anonymous-profiles',
      index: true,
    },
    { name: 'parentComment', type: 'relationship', relationTo: 'comments', index: true },
    { name: 'content', type: 'textarea', required: true, maxLength: 2000 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: COMMENT_STATUSES.map((value) => ({ label: value, value })),
      index: true,
    },
    { name: 'depth', type: 'number', required: true, defaultValue: 0 },
    { name: 'replyCount', type: 'number', required: true, defaultValue: 0 },
    { name: 'authorDisplayNameSnapshot', type: 'text', required: true },
    { name: 'authorAvatarSnapshot', type: 'text' },
    { name: 'editedAt', type: 'date' },
    { name: 'moderationReason', type: 'textarea' },
  ],
  timestamps: true,
}
