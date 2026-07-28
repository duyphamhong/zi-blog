import type { CollectionConfig, FieldAccess } from 'payload'

import { env } from '@/config/env'
import {
  isActiveStaff,
  postCreateAccess,
  postDeleteAccess,
  postReadAccess,
  postUpdateAccess,
} from '@/modules/identity'
import { removePostSearchBeforeDelete, synchronizePostSearchAfterChange } from '@/modules/search'
import { postContentEditor } from '@/payload/fields/postContentEditor'
import { seoFields } from '@/payload/fields/seoFields'
import { slugField } from '@/payload/fields/slugField'
import { importPostMarkdown } from '@/payload/hooks/importPostMarkdown'
import { preparePost } from '@/payload/hooks/preparePost'
import {
  revalidatePostAfterChange,
  revalidatePostAfterDelete,
} from '@/payload/hooks/revalidatePost'

const staffCanReadImportFields: FieldAccess = ({ req }) => isActiveStaff(req.user)
const denyImportHashMutation: FieldAccess = () => false

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
      editor: postContentEditor,
      required: true,
    },
    {
      type: 'collapsible',
      label: { en: 'Markdown Import', vi: 'Nhập Markdown' },
      admin: {
        description:
          'Paste a Zi-Blog Markdown article, check Import Markdown into Content, then Save or Publish. Clearing the source does not clear Content.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'markdownSource',
          type: 'textarea',
          access: {
            read: staffCanReadImportFields,
          },
          admin: {
            description:
              'Use TITLE, SLUG, EXCERPT, SEO_TITLE, SEO_DESCRIPTION, then a standalone CONTENT: line. Unchanged source is not imported again unless you check the import box.',
            rows: 18,
          },
          label: { en: 'Zi-Blog Markdown source', vi: 'Nguồn Markdown Zi-Blog' },
          localized: true,
        },
        {
          name: 'importMarkdownIntoContent',
          type: 'checkbox',
          access: {
            read: staffCanReadImportFields,
          },
          admin: {
            description:
              'On the next Save or Publish, replace Content from the current Markdown source. This also force re-imports unchanged source and resets after success.',
          },
          defaultValue: false,
          label: {
            en: 'Import Markdown into Content',
            vi: 'Nhập Markdown vào nội dung',
          },
          localized: true,
        },
      ],
    },
    {
      name: 'lastImportedMarkdownHash',
      type: 'text',
      access: {
        create: denyImportHashMutation,
        read: staffCanReadImportFields,
        update: denyImportHashMutation,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
      localized: true,
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
    beforeChange: [importPostMarkdown, preparePost],
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
