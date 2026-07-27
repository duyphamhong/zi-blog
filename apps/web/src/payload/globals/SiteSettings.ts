import type { GlobalConfig } from 'payload'

import { editorOrSuperAdmin, isActiveStaff } from '@/modules/identity'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { en: 'Site settings', vi: 'Cài đặt trang' },
  access: {
    read: ({ req }) => isActiveStaff(req.user),
    update: editorOrSuperAdmin,
  },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Zi-Blog', required: true },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: { en: 'Site description', vi: 'Mô tả trang' },
      localized: true,
      required: true,
    },
    { name: 'siteUrl', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    { name: 'defaultAuthor', type: 'relationship', relationTo: 'users' },
    {
      name: 'defaultSeoTitle',
      type: 'text',
      label: { en: 'Default SEO title', vi: 'Tiêu đề SEO mặc định' },
      localized: true,
    },
    {
      name: 'defaultSeoDescription',
      type: 'textarea',
      label: { en: 'Default SEO description', vi: 'Mô tả SEO mặc định' },
      localized: true,
    },
    { name: 'defaultSocialImage', type: 'upload', relationTo: 'media' },
    { name: 'postsPerPage', type: 'number', defaultValue: 10, max: 50, min: 1 },
    { name: 'enableDarkMode', type: 'checkbox', defaultValue: true },
  ],
}
