import type { CollectionConfig } from 'payload'

import { editorOrSuperAdmin, isActiveStaff } from '@/modules/identity'
import { MAX_SEARCH_PROJECTION_TEXT_LENGTH } from '@/modules/search/constants'

export const SearchDocuments: CollectionConfig = {
  slug: 'search-documents',
  access: {
    create: editorOrSuperAdmin,
    delete: editorOrSuperAdmin,
    read: ({ req }) => isActiveStaff(req.user),
    update: editorOrSuperAdmin,
  },
  admin: {
    hidden: true,
    useAsTitle: 'title',
  },
  fields: [
    { name: 'postLocaleKey', type: 'text', index: true, required: true, unique: true },
    { name: 'post', type: 'relationship', index: true, relationTo: 'posts', required: true },
    {
      name: 'locale',
      type: 'select',
      index: true,
      options: [
        { label: { en: 'Vietnamese', vi: 'Tiếng Việt' }, value: 'vi' },
        { label: { en: 'English', vi: 'Tiếng Anh' }, value: 'en' },
      ],
      required: true,
    },
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', index: true, required: true },
    { name: 'excerpt', type: 'textarea', required: true },
    {
      name: 'plainTextContent',
      type: 'textarea',
      maxLength: MAX_SEARCH_PROJECTION_TEXT_LENGTH,
    },
    {
      name: 'normalizedSearchText',
      type: 'textarea',
      maxLength: MAX_SEARCH_PROJECTION_TEXT_LENGTH,
      required: true,
    },
    { name: 'publishedAt', type: 'date', index: true, required: true },
  ],
  timestamps: true,
}
