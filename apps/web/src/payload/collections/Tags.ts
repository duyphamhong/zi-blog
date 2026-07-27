import type { CollectionConfig } from 'payload'

import { editorOrSuperAdmin } from '@/modules/identity'
import { slugField } from '@/payload/fields/slugField'

export const Tags: CollectionConfig = {
  slug: 'tags',
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
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'description', type: 'textarea' },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
  ],
}
