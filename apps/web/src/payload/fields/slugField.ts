import type { Field } from 'payload'

import { normalizeSlug } from '@/modules/content/validation'
import { parseContentLocale } from '@/modules/platform'

export function slugField(sourceField: string): Field {
  return {
    label: { en: 'Slug', vi: 'Đường dẫn' },
    localized: true,
    name: 'slug',
    type: 'text',
    admin: {
      description:
        'Generated from the title or name until manually edited. Published post slug changes can break existing links.',
      position: 'sidebar',
    },
    hooks: {
      beforeValidate: [
        ({ req, siblingData, value }) => {
          const locale = parseContentLocale(req.locale)
          if (typeof value === 'string' && value.trim())
            return normalizeSlug(value, locale ?? undefined)
          const source = siblingData?.[sourceField]
          return typeof source === 'string' ? normalizeSlug(source, locale ?? undefined) : value
        },
      ],
    },
    index: true,
    required: true,
    unique: true,
  }
}
