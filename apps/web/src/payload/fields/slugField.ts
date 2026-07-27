import type { Field } from 'payload'

import { normalizeSlug } from '@/modules/content/validation'

export function slugField(sourceField: string): Field {
  return {
    name: 'slug',
    type: 'text',
    admin: {
      description:
        'Generated from the title or name until manually edited. Published post slug changes can break existing links.',
      position: 'sidebar',
    },
    hooks: {
      beforeValidate: [
        ({ siblingData, value }) => {
          if (typeof value === 'string' && value.trim()) return normalizeSlug(value)
          const source = siblingData?.[sourceField]
          return typeof source === 'string' ? normalizeSlug(source) : value
        },
      ],
    },
    index: true,
    required: true,
    unique: true,
  }
}
