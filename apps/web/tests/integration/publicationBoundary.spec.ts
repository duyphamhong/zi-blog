import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getPublishedPostBySlug, getPublishedPostsForSitemap } from '@/modules/content'
import { seed } from '@/payload/seed'
import { lexicalDocument } from '@/payload/seed/content'

let payload: Payload
const suffix = `${Date.now()}-${Math.round(Math.random() * 10000)}`
const ids: {
  category?: number
  editor?: number
  author?: number
  posts: number[]
} = { posts: [] }

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {
  for (const id of ids.posts) {
    await payload.delete({
      collection: 'posts',
      context: { skipRevalidation: true },
      id,
      overrideAccess: true,
    })
  }
  if (ids.category) {
    await payload.delete({ collection: 'categories', id: ids.category, overrideAccess: true })
  }
  if (ids.author) {
    await payload.delete({
      collection: 'users',
      context: { seed: true },
      id: ids.author,
      overrideAccess: true,
    })
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

describe('publication boundary', () => {
  it('denies author publication, permits editor publication, and exposes only published data', async () => {
    const author = await payload.create({
      collection: 'users',
      context: { seed: true },
      data: {
        displayName: 'Integration Author',
        email: `author-${suffix}@example.com`,
        password: 'integration-password',
        role: 'author',
        status: 'active',
        username: `author-${suffix}`,
      },
      overrideAccess: true,
    })
    ids.author = author.id
    const editor = await payload.create({
      collection: 'users',
      context: { seed: true },
      data: {
        displayName: 'Integration Editor',
        email: `editor-${suffix}@example.com`,
        password: 'integration-password',
        role: 'editor',
        status: 'active',
        username: `editor-${suffix}`,
      },
      overrideAccess: true,
    })
    ids.editor = editor.id
    const category = await payload.create({
      collection: 'categories',
      data: {
        isActive: true,
        name: `Integration ${suffix}`,
        slug: `integration-${suffix}`,
      },
      overrideAccess: true,
    })
    ids.category = category.id
    const post = await payload.create({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: {
        _status: 'draft',
        author: author.id,
        category: category.id,
        content: lexicalDocument(['Integration draft content.']),
        excerpt:
          'This integration excerpt is long enough to satisfy the configured validation boundary.',
        slug: `integration-draft-${suffix}`,
        title: 'Integration Draft',
        visibility: 'public',
      },
      draft: true,
      overrideAccess: true,
    })
    ids.posts.push(post.id)

    const publicDrafts = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 10,
      overrideAccess: false,
      pagination: false,
      where: { slug: { equals: post.slug } },
    })
    expect(publicDrafts.docs).toHaveLength(0)

    await expect(
      payload.update({
        collection: 'posts',
        context: { skipRevalidation: true },
        data: { _status: 'published' },
        draft: false,
        id: post.id,
        overrideAccess: false,
        user: author,
      }),
    ).rejects.toThrow()

    await payload.update({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: { _status: 'published' },
      draft: false,
      id: post.id,
      overrideAccess: false,
      user: editor,
    })

    const published = await getPublishedPostBySlug(post.slug)
    expect(published?.slug).toBe(post.slug)
  })

  it('excludes draft and unlisted posts from sitemap data', async () => {
    if (!ids.author || !ids.category) throw new Error('Publication fixture was not created')
    const draft = await payload.create({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: {
        _status: 'draft',
        author: ids.author,
        category: ids.category,
        content: lexicalDocument(['Sitemap draft integration content.']),
        excerpt: 'This draft excerpt is long enough to satisfy the configured validation boundary.',
        slug: `integration-sitemap-draft-${suffix}`,
        title: 'Integration Sitemap Draft',
        visibility: 'public',
      },
      draft: true,
      overrideAccess: true,
    })
    ids.posts.push(draft.id)
    const unlisted = await payload.create({
      collection: 'posts',
      context: { skipRevalidation: true },
      data: {
        _status: 'published',
        author: ids.author,
        category: ids.category,
        content: lexicalDocument(['Unlisted integration content.']),
        excerpt:
          'This unlisted excerpt is long enough to satisfy the configured validation boundary.',
        slug: `integration-unlisted-${suffix}`,
        title: 'Integration Unlisted',
        visibility: 'unlisted',
      },
      draft: false,
      overrideAccess: true,
    })
    ids.posts.push(unlisted.id)

    const sitemapPosts = await getPublishedPostsForSitemap()
    expect(sitemapPosts.some((post) => post.slug === unlisted.slug)).toBe(false)
    expect(sitemapPosts.some((post) => post.slug === draft.slug)).toBe(false)
  })

  it('keeps the seed idempotent', async () => {
    await seed(payload)
    const first = await payload.count({
      collection: 'posts',
      overrideAccess: true,
      where: {
        slug: {
          in: [
            'modular-monolith-first',
            'safe-public-payload-queries',
            'draft-publication-boundary',
          ],
        },
      },
    })
    await seed(payload)
    const second = await payload.count({
      collection: 'posts',
      overrideAccess: true,
      where: {
        slug: {
          in: [
            'modular-monolith-first',
            'safe-public-payload-queries',
            'draft-publication-boundary',
          ],
        },
      },
    })
    expect(first.totalDocs).toBe(3)
    expect(second.totalDocs).toBe(first.totalDocs)
  })
})
