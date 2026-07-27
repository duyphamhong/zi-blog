import type { Field } from 'payload'

function validateAbsoluteUrl(value: null | string | undefined): string | true {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? true
      : 'Canonical URL must use HTTP or HTTPS'
  } catch {
    return 'Canonical URL must be absolute'
  }
}

export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  label: { en: 'SEO', vi: 'Tối ưu tìm kiếm' },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      label: { en: 'Meta title', vi: 'Tiêu đề SEO' },
      localized: true,
      maxLength: 70,
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: { en: 'Meta description', vi: 'Mô tả SEO' },
      localized: true,
      maxLength: 180,
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      label: { en: 'Canonical URL', vi: 'URL chính tắc' },
      localized: true,
      validate: validateAbsoluteUrl,
    },
    {
      name: 'socialImage',
      type: 'upload',
      label: { en: 'Social image', vi: 'Ảnh mạng xã hội' },
      relationTo: 'media',
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      label: { en: 'Exclude from search engines', vi: 'Không lập chỉ mục' },
      defaultValue: false,
    },
  ],
}
