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
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      maxLength: 70,
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      maxLength: 180,
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      validate: validateAbsoluteUrl,
    },
    {
      name: 'socialImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
