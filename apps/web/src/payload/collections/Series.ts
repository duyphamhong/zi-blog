import type { CollectionConfig } from 'payload'

import { activeSeriesReadAccess, editorOrSuperAdmin } from '@/modules/identity'
import { seoFields } from '@/payload/fields/seoFields'
import { slugField } from '@/payload/fields/slugField'

export const Series: CollectionConfig = {
  slug: 'series',
  labels: {
    plural: { en: 'Series', vi: 'Loạt bài' },
    singular: { en: 'Series', vi: 'Loạt bài' },
  },
  access: {
    create: editorOrSuperAdmin,
    delete: editorOrSuperAdmin,
    read: activeSeriesReadAccess,
    update: editorOrSuperAdmin,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'author', 'isActive'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: { en: 'Title', vi: 'Tiêu đề' },
      localized: true,
      required: true,
    },
    slugField('title'),
    {
      name: 'description',
      type: 'textarea',
      label: { en: 'Description', vi: 'Mô tả' },
      localized: true,
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
    seoFields,
  ],
}
