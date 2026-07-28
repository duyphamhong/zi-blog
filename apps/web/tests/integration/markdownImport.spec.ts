import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { hashMarkdownSource } from '@/modules/content/markdown-import'
import type { User } from '@/payload-types'
import { lexicalDocument } from '@/payload/seed/content'

let payload: Payload
let editorUser: User
const suffix = `${Date.now()}-${Math.round(Math.random() * 10000)}`
const ids: {
  category?: number
  editor?: number
  post?: number
} = {}

function articleSource({
  body,
  language,
  slug,
  title,
}: {
  body: string
  language: 'en' | 'vi'
  slug: string
  title: string
}): string {
  const excerpt =
    language === 'vi'
      ? 'Bản tóm tắt Markdown đủ dài để vượt qua quy tắc xác thực của bài viết.'
      : 'This Markdown excerpt is long enough to pass the post validation boundary.'
  return [
    `TITLE: ${title}`,
    `SLUG: ${slug}`,
    `EXCERPT: ${excerpt}`,
    `SEO_TITLE: ${title} SEO`,
    `SEO_DESCRIPTION: ${excerpt}`,
    'CONTENT:',
    '## Imported section',
    '',
    body,
    '',
    '```typescript',
    'const imported: boolean = true',
    '```',
  ].join('\n')
}

beforeAll(async () => {
  payload = await getPayload({ config })
  const editor = await payload.create({
    collection: 'users',
    context: { seed: true },
    data: {
      displayName: 'Markdown Integration Editor',
      email: `markdown-editor-${suffix}@example.com`,
      password: 'integration-password',
      role: 'editor',
      status: 'active',
      username: `markdown-editor-${suffix}`,
    },
    overrideAccess: true,
  })
  editorUser = editor
  ids.editor = editor.id
  const category = await payload.create({
    collection: 'categories',
    data: {
      isActive: true,
      name: `Markdown Integration ${suffix}`,
      slug: `markdown-integration-${suffix}`,
    },
    overrideAccess: true,
  })
  ids.category = category.id
})

afterAll(async () => {
  if (ids.post) {
    await payload.delete({
      collection: 'posts',
      context: { skipRevalidation: true },
      id: ids.post,
      overrideAccess: true,
    })
  }
  if (ids.category) {
    await payload.delete({ collection: 'categories', id: ids.category, overrideAccess: true })
  }
  if (ids.editor) {
    await payload.delete({
      collection: 'users',
      context: { seed: true },
      id: ids.editor,
      overrideAccess: true,
    })
  }
  await payload.destroy()
})

describe('Markdown import hook', () => {
  it('imports localized drafts without weakening save, publish, or public-read boundaries', async () => {
    if (!ids.editor || !ids.category) throw new Error('Markdown fixtures were not created')

    const vietnameseSource = articleSource({
      body: 'Nội dung được nhập từ Markdown.',
      language: 'vi',
      slug: `duong-dan-markdown-${suffix}`,
      title: 'Bài viết Markdown',
    })
    const created = await payload.create({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: {
        _status: 'draft',
        author: ids.editor,
        category: ids.category,
        importMarkdownIntoContent: true,
        markdownSource: vietnameseSource,
        visibility: 'public',
      },
      draft: true,
      fallbackLocale: false,
      locale: 'vi',
      overrideAccess: false,
      user: editorUser,
    })
    ids.post = created.id

    expect(created).toMatchObject({
      _status: 'draft',
      importMarkdownIntoContent: false,
      lastImportedMarkdownHash: hashMarkdownSource(vietnameseSource),
      markdownSource: vietnameseSource,
      slug: `duong-dan-markdown-${suffix}`,
      title: 'Bài viết Markdown',
    })
    expect(created.content.root).toMatchObject({
      children: expect.any(Array),
      type: 'root',
    })
    expect(
      created.content.root.children.some(
        (node) =>
          node.type === 'block' &&
          'fields' in node &&
          node.fields &&
          typeof node.fields === 'object' &&
          'language' in node.fields &&
          node.fields.language === 'typescript',
      ),
    ).toBe(true)

    const manualContent = lexicalDocument(['A manual Lexical edit must remain intact.'])
    const manuallyEdited = await payload.update({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: { content: manualContent },
      draft: true,
      fallbackLocale: false,
      id: created.id,
      locale: 'vi',
      overrideAccess: false,
      user: editorUser,
    })
    expect(manuallyEdited.content).toEqual(manualContent)
    expect(manuallyEdited.lastImportedMarkdownHash).toBe(hashMarkdownSource(vietnameseSource))

    const changedVietnameseSource = vietnameseSource.replace(
      'Nội dung được nhập từ Markdown.',
      'Nội dung Markdown đã thay đổi.',
    )
    const reimported = await payload.update({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: {
        importMarkdownIntoContent: true,
        markdownSource: changedVietnameseSource,
      },
      draft: true,
      fallbackLocale: false,
      id: created.id,
      locale: 'vi',
      overrideAccess: false,
      user: editorUser,
    })
    expect(reimported.lastImportedMarkdownHash).toBe(hashMarkdownSource(changedVietnameseSource))
    expect(JSON.stringify(reimported.content)).toContain('Nội dung Markdown đã thay đổi.')

    await expect(
      payload.update({
        collection: 'posts',
        context: { skipRevalidation: true },
        data: {
          importMarkdownIntoContent: true,
          markdownSource: 'TITLE: Invalid import without a delimiter',
        },
        draft: true,
        fallbackLocale: false,
        id: created.id,
        locale: 'vi',
        overrideAccess: false,
        user: editorUser,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'MISSING_CONTENT_DELIMITER',
      },
    })
    const afterFailedImport = await payload.findByID({
      collection: 'posts',
      draft: true,
      fallbackLocale: false,
      id: created.id,
      locale: 'vi',
      overrideAccess: true,
    })
    expect(afterFailedImport.content).toEqual(reimported.content)
    expect(afterFailedImport.lastImportedMarkdownHash).toBe(reimported.lastImportedMarkdownHash)

    const cleared = await payload.update({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: { markdownSource: '' },
      draft: true,
      fallbackLocale: false,
      id: created.id,
      locale: 'vi',
      overrideAccess: false,
      user: editorUser,
    })
    expect(cleared.content).toEqual(reimported.content)
    expect(cleared.lastImportedMarkdownHash).toBe(reimported.lastImportedMarkdownHash)

    const restoredVietnamese = await payload.update({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: {
        importMarkdownIntoContent: true,
        markdownSource: changedVietnameseSource,
      },
      draft: true,
      fallbackLocale: false,
      id: created.id,
      locale: 'vi',
      overrideAccess: false,
      user: editorUser,
    })
    expect(restoredVietnamese.importMarkdownIntoContent).toBe(false)

    const englishSource = articleSource({
      body: 'Content imported from Markdown.',
      language: 'en',
      slug: `markdown-path-${suffix}`,
      title: 'Markdown article',
    })
    await payload.update({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: {
        importMarkdownIntoContent: true,
        markdownSource: englishSource,
      },
      draft: true,
      fallbackLocale: false,
      id: created.id,
      locale: 'en',
      overrideAccess: false,
      user: editorUser,
    })

    const published = await payload.update({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: { _status: 'published' },
      draft: false,
      fallbackLocale: false,
      id: created.id,
      locale: 'vi',
      overrideAccess: false,
      user: editorUser,
    })
    expect(published._status).toBe('published')

    const publicPost = await payload.findByID({
      collection: 'posts',
      fallbackLocale: false,
      id: created.id,
      locale: 'vi',
      overrideAccess: false,
    })
    expect(publicPost.title).toBe('Bài viết Markdown')
    expect(publicPost.markdownSource).toBeUndefined()
    expect(publicPost.lastImportedMarkdownHash).toBeUndefined()
    expect(publicPost.importMarkdownIntoContent).toBeUndefined()
  })
})
