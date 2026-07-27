import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import {
  postCreateAccess,
  postDeleteAccess,
  postReadAccess,
  postUpdateAccess,
} from '@/modules/identity'
import { env } from '@/config/env'
import { CodeBlock } from '@/payload/blocks/Code'
import { seoFields } from '@/payload/fields/seoFields'
import { slugField } from '@/payload/fields/slugField'
import { preparePost } from '@/payload/hooks/preparePost'
import {
  revalidatePostAfterChange,
  revalidatePostAfterDelete,
} from '@/payload/hooks/revalidatePost'
import { removePostSearchBeforeDelete, synchronizePostSearchAfterChange } from '@/modules/search'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    plural: { en: 'Posts', vi: 'Bài viết' },
    singular: { en: 'Post', vi: 'Bài viết' },
  },
  access: {
    create: postCreateAccess,
    delete: postDeleteAccess,
    read: postReadAccess,
    update: postUpdateAccess,
  },
  admin: {
    defaultColumns: ['title', '_status', 'author', 'category', 'publishedAt'],
    preview: (data, { locale }) =>
      `${env.SERVER_URL}/${locale || 'vi'}/preview/posts/${String(data.id ?? '')}`,
    useAsTitle: 'title',
  },
  defaultPopulate: {
    title: true,
    slug: true,
    excerpt: true,
    coverImage: true,
    author: true,
    category: true,
    tags: true,
    series: true,
    seriesOrder: true,
    featured: true,
    visibility: true,
    publishedAt: true,
    readingTimeMinutes: true,
    seo: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: { en: 'Title', vi: 'Tiêu đề' },
      localized: true,
      required: true,
    },
    slugField('title'),
    {
      name: 'excerpt',
      type: 'textarea',
      label: { en: 'Excerpt', vi: 'Tóm tắt' },
      localized: true,
      maxLength: 320,
      minLength: 40,
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: { en: 'Content', vi: 'Nội dung' },
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BlocksFeature({ blocks: [CodeBlock] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          HorizontalRuleFeature(),
        ],
      }),
      required: true,
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'author',
      type: 'relationship',
      index: true,
      relationTo: 'users',
      required: true,
    },
    {
      name: 'coAuthors',
      type: 'relationship',
      hasMany: true,
      relationTo: 'users',
    },
    {
      name: 'category',
      type: 'relationship',
      index: true,
      relationTo: 'categories',
      required: true,
    },
    { name: 'tags', type: 'relationship', hasMany: true, relationTo: 'tags' },
    { name: 'series', type: 'relationship', relationTo: 'series' },
    {
      name: 'seriesOrder',
      type: 'number',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData.series),
      },
      min: 1,
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
    {
      name: 'visibility',
      type: 'select',
      defaultValue: 'public',
      index: true,
      options: [
        { label: { en: 'Public', vi: 'Công khai' }, value: 'public' },
        { label: { en: 'Unlisted', vi: 'Không công khai' }, value: 'unlisted' },
      ],
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'readingTimeMinutes',
      type: 'number',
      admin: {
        description: 'Calculated automatically from the article text.',
        readOnly: true,
      },
      defaultValue: 1,
      min: 1,
    },
    seoFields,
  ],
  hooks: {
    afterChange: [synchronizePostSearchAfterChange, revalidatePostAfterChange],
    afterDelete: [revalidatePostAfterDelete],
    beforeDelete: [removePostSearchBeforeDelete],
    beforeChange: [preparePost],
  },
  timestamps: true,
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
    maxPerDoc: 50,
  },
}
