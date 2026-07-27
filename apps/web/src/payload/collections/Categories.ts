import type { CollectionConfig } from 'payload'

import { activeCategoryReadAccess, editorOrSuperAdmin } from '@/modules/identity'
import { seoFields } from '@/payload/fields/seoFields'
import { slugField } from '@/payload/fields/slugField'
import { validateCategoryParent } from '@/payload/hooks/validateCategoryParent'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    plural: { en: 'Categories', vi: 'Chuyên mục' },
    singular: { en: 'Category', vi: 'Chuyên mục' },
  },
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
    { name: 'parent', type: 'relationship', relationTo: 'categories' },
    { name: 'displayOrder', type: 'number', defaultValue: 0, index: true },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
    seoFields,
  ],
  hooks: {
    beforeChange: [validateCategoryParent],
  },
}
