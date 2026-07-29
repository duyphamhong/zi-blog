import type { CollectionConfig } from 'payload'

import { isActiveStaff } from '@/modules/identity'

export const PostStatistics: CollectionConfig = {
  slug: 'post-statistics', labels: { plural: { en: 'Post statistics', vi: 'Thống kê bài viết' }, singular: { en: 'Post statistic', vi: 'Thống kê bài viết' } },
  access: { admin: ({ req }) => isActiveStaff(req.user), create: () => false, delete: () => false, read: ({ req }) => isActiveStaff(req.user), update: () => false },
  fields: [
    { name: 'postId', type: 'text', required: true, unique: true, index: true },
    { name: 'totalViews', type: 'number', required: true, defaultValue: 0 }, { name: 'uniqueViews', type: 'number', required: true, defaultValue: 0 },
    { name: 'likes', type: 'number', required: true, defaultValue: 0 }, { name: 'dislikes', type: 'number', required: true, defaultValue: 0 }, { name: 'shares', type: 'number', required: true, defaultValue: 0 },
  ], timestamps: true,
}
