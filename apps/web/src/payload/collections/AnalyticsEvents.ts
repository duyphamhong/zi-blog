import type { CollectionConfig } from 'payload'

import { isActiveStaff } from '@/modules/identity'
import { ANALYTICS_EVENT_TYPES, SHARE_CHANNELS } from '@/modules/analytics'

export const AnalyticsEvents: CollectionConfig = {
  slug: 'analytics-events',
  labels: {
    plural: { en: 'Analytics events', vi: 'Sự kiện phân tích' },
    singular: { en: 'Analytics event', vi: 'Sự kiện phân tích' },
  },
  access: {
    admin: ({ req }) => isActiveStaff(req.user),
    create: () => false,
    delete: () => false,
    read: ({ req }) => isActiveStaff(req.user),
    update: () => false,
  },
  fields: [
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: ANALYTICS_EVENT_TYPES.map((value) => ({ label: value, value })),
      index: true,
    },
    { name: 'postId', type: 'text', required: true, index: true },
    // Retained only for historic records. New events are identified by a hashed browser session.
    { name: 'anonymousProfile', type: 'relationship', relationTo: 'anonymous-profiles' },
    { name: 'sessionIdHash', type: 'text', required: true },
    { name: 'deduplicationKey', type: 'text', unique: true, index: true },
    {
      name: 'metadataChannel',
      type: 'select',
      options: SHARE_CHANNELS.map((value) => ({ label: value, value })),
    },
    { name: 'occurredAt', type: 'date', required: true, index: true },
    {
      name: 'processingStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processed', value: 'processed' },
      ],
      index: true,
    },
  ],
  timestamps: true,
}
