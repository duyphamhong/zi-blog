import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionConfig } from 'payload'

import { mediaMutationAccess, mediaUpdateOrDeleteAccess } from '@/modules/identity/access'
import { prepareMedia } from '@/payload/hooks/prepareMedia'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    plural: { en: 'Media', vi: 'Thư viện' },
    singular: { en: 'Media item', vi: 'Tệp phương tiện' },
  },
  access: {
    create: mediaMutationAccess,
    delete: mediaUpdateOrDeleteAccess,
    read: () => true,
    update: mediaUpdateOrDeleteAccess,
  },
  admin: {
    useAsTitle: 'alt',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: { en: 'Alternative text', vi: 'Văn bản thay thế' },
      localized: true,
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: { en: 'Caption', vi: 'Chú thích' },
      localized: true,
    },
    {
      name: 'credit',
      type: 'text',
      label: { en: 'Credit', vi: 'Ghi công' },
      localized: true,
    },
    {
      name: 'copyright',
      type: 'text',
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      admin: {
        hidden: true,
        readOnly: true,
      },
      relationTo: 'users',
    },
  ],
  hooks: {
    beforeChange: [prepareMedia],
  },
  upload: {
    adminThumbnail: 'small',
    focalPoint: true,
    imageSizes: [
      { name: 'small', width: 480 },
      { name: 'medium', width: 960 },
      { name: 'large', width: 1440 },
    ],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    staticDir: path.resolve(dirname, '../../../public/media'),
  },
}
