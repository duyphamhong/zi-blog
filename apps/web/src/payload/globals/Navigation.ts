import type { Field, GlobalConfig } from 'payload'

import { editorOrSuperAdmin, isActiveStaff } from '@/modules/identity'

const linkFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    label: { en: 'Label', vi: 'Nhãn' },
    localized: true,
    required: true,
  },
  {
    name: 'type',
    type: 'select',
    defaultValue: 'internal',
    options: [
      { label: 'Internal', value: 'internal' },
      { label: 'External', value: 'external' },
    ],
    required: true,
  },
  {
    name: 'reference',
    type: 'relationship',
    admin: {
      condition: (_, siblingData) => siblingData.type === 'internal',
    },
    relationTo: ['posts', 'categories', 'series'],
    validate: (value: unknown, { siblingData }: { siblingData?: Record<string, unknown> }) =>
      siblingData?.type !== 'internal' || value ? true : 'Choose an internal destination',
  },
  {
    name: 'url',
    type: 'text',
    admin: {
      condition: (_, siblingData) => siblingData.type === 'external',
    },
    validate: (value: unknown, { siblingData }: { siblingData?: Record<string, unknown> }) =>
      siblingData?.type !== 'external' || value ? true : 'Enter an external URL',
  },
  { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: { en: 'Navigation', vi: 'Điều hướng' },
  access: {
    read: ({ req }) => isActiveStaff(req.user),
    update: editorOrSuperAdmin,
  },
  fields: [
    { name: 'headerLinks', type: 'array', fields: linkFields, maxRows: 10 },
    { name: 'footerLinks', type: 'array', fields: linkFields, maxRows: 20 },
    {
      name: 'footerText',
      type: 'textarea',
      label: { en: 'Footer text', vi: 'Nội dung chân trang' },
      localized: true,
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
      maxRows: 10,
    },
  ],
}
