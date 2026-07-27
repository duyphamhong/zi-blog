import type { GlobalConfig } from 'payload'

import { editorOrSuperAdmin, isActiveStaff } from '@/modules/identity'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: ({ req }) => isActiveStaff(req.user),
    update: editorOrSuperAdmin,
  },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Zi-Blog', required: true },
    { name: 'siteDescription', type: 'textarea', required: true },
    { name: 'siteUrl', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    { name: 'defaultAuthor', type: 'relationship', relationTo: 'users' },
    { name: 'defaultSeoTitle', type: 'text' },
    { name: 'defaultSeoDescription', type: 'textarea' },
    { name: 'defaultSocialImage', type: 'upload', relationTo: 'media' },
    { name: 'postsPerPage', type: 'number', defaultValue: 10, max: 50, min: 1 },
    { name: 'enableDarkMode', type: 'checkbox', defaultValue: true },
  ],
}
