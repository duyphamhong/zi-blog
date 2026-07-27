import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionConfig } from 'payload'

import { mediaMutationAccess, mediaUpdateOrDeleteAccess } from '@/modules/identity/access'
import { prepareMedia } from '@/payload/hooks/prepareMedia'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
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
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'credit',
      type: 'text',
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
