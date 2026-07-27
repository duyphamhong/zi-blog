import type { CollectionConfig } from 'payload'

import { activeCategoryReadAccess, editorOrSuperAdmin } from '@/modules/identity'
import { seoFields } from '@/payload/fields/seoFields'
import { slugField } from '@/payload/fields/slugField'
import { validateCategoryParent } from '@/payload/hooks/validateCategoryParent'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: editorOrSuperAdmin,
    delete: editorOrSuperAdmin,
    read: activeCategoryReadAccess,
    update: editorOrSuperAdmin,
  },
  admin: {
    defaultColumns: ['name', 'slug', 'isActive', 'displayOrder'],
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'description', type: 'textarea' },
    { name: 'parent', type: 'relationship', relationTo: 'categories' },
    { name: 'displayOrder', type: 'number', defaultValue: 0, index: true },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
    seoFields,
  ],
  hooks: {
    beforeChange: [validateCategoryParent],
  },
}
