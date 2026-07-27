import type { CollectionConfig } from 'payload'

import { editorOrSuperAdmin } from '@/modules/identity'
import { slugField } from '@/payload/fields/slugField'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    plural: { en: 'Tags', vi: 'Thẻ' },
    singular: { en: 'Tag', vi: 'Thẻ' },
  },
  access: {
    create: editorOrSuperAdmin,
    delete: editorOrSuperAdmin,
    read: () => true,
    update: editorOrSuperAdmin,
  },
  admin: {
    defaultColumns: ['name', 'slug', 'isFeatured'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { en: 'Name', vi: 'Tên' },
      localized: true,
      required: true,
    },
    slugField('name'),
    {
      name: 'description',
      type: 'textarea',
      label: { en: 'Description', vi: 'Mô tả' },
      localized: true,
    },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
  ],
}
