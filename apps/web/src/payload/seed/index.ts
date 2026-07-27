import type { Payload } from 'payload'

import { env } from '@/config/env'

import { lexicalDocument } from './content'

const seedContext = { seed: true, skipRevalidation: true }

async function upsertUser(
  payload: Payload,
  input: {
    displayName: string
    email: string
    password: string
    role: 'author' | 'super_admin'
    username: string
  },
) {
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { email: { equals: input.email } },
  })
  const data = {
    ...input,
    status: 'active' as const,
  }
  return existing.docs[0]
    ? payload.update({
        collection: 'users',
        context: seedContext,
        data,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
    : payload.create({
        collection: 'users',
        context: seedContext,
        data,
        overrideAccess: true,
      })
}

async function upsertCategory(
  payload: Payload,
  input: { description: string; displayOrder: number; name: string; slug: string },
) {
  const existing = await payload.find({
    collection: 'categories',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: input.slug } },
  })
  const data = { ...input, isActive: true }
  return existing.docs[0]
    ? payload.update({
        collection: 'categories',
        context: seedContext,
        data,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
    : payload.create({
        collection: 'categories',
        context: seedContext,
        data,
        overrideAccess: true,
      })
}

async function upsertTag(
  payload: Payload,
  input: { description: string; isFeatured: boolean; name: string; slug: string },
) {
  const existing = await payload.find({
    collection: 'tags',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: input.slug } },
  })
  return existing.docs[0]
    ? payload.update({
        collection: 'tags',
        context: seedContext,
        data: input,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
    : payload.create({
        collection: 'tags',
        context: seedContext,
        data: input,
        overrideAccess: true,
      })
}

async function upsertPost(
  payload: Payload,
  input: {
    author: number
    category: number
    excerpt: string
    featured: boolean
    paragraphs: string[]
    series: number
    seriesOrder: number
    slug: string
    status: 'draft' | 'published'
    tags: number[]
    title: string
  },
) {
  const existing = await payload.find({
    collection: 'posts',
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: input.slug } },
  })
  const data = {
    _status: input.status,
    author: input.author,
    category: input.category,
    content: lexicalDocument(input.paragraphs),
    excerpt: input.excerpt,
    featured: input.featured,
    series: input.series,
    seriesOrder: input.seriesOrder,
    slug: input.slug,
    tags: input.tags,
    title: input.title,
    visibility: 'public' as const,
  }

  if (existing.docs[0]) {
    return input.status === 'draft'
      ? payload.update({
          collection: 'posts',
          context: seedContext,
          data,
          draft: true,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : payload.update({
          collection: 'posts',
          context: seedContext,
          data,
          draft: false,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
  }
  return input.status === 'draft'
    ? payload.create({
        collection: 'posts',
        context: seedContext,
        data,
        draft: true,
        overrideAccess: true,
      })
    : payload.create({
        collection: 'posts',
        context: seedContext,
        data,
        draft: false,
        overrideAccess: true,
      })
}

export async function seed(payload: Payload): Promise<void> {
  const administrator = await upsertUser(payload, {
    displayName: env.SEED_ADMIN_NAME,
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    role: 'super_admin',
    username: 'administrator',
  })

  if (!env.ENABLE_SEED_SAMPLE_CONTENT) {
    payload.logger.info('Seeded administrator; sample content is disabled')
    return
  }

  const author = await upsertUser(payload, {
    displayName: 'Zi-Blog Engineering',
    email: 'author@example.com',
    password: env.SEED_ADMIN_PASSWORD,
    role: 'author',
    username: 'zi-blog-engineering',
  })

  const [architecture, tooling, operations] = await Promise.all([
    upsertCategory(payload, {
      description: 'System design, trade-offs, and maintainable boundaries.',
      displayOrder: 1,
      name: 'Architecture',
      slug: 'architecture',
    }),
    upsertCategory(payload, {
      description: 'Developer tools and productive engineering workflows.',
      displayOrder: 2,
      name: 'Tooling',
      slug: 'tooling',
    }),
    upsertCategory(payload, {
      description: 'Running and improving software in real environments.',
      displayOrder: 3,
      name: 'Operations',
      slug: 'operations',
    }),
  ])

  const tagInputs = [
    {
      description: 'Type-safe application development.',
      isFeatured: true,
      name: 'TypeScript',
      slug: 'typescript',
    },
    {
      description: 'React applications with the App Router.',
      isFeatured: true,
      name: 'Next.js',
      slug: 'nextjs',
    },
    {
      description: 'Content infrastructure with Payload.',
      isFeatured: true,
      name: 'Payload CMS',
      slug: 'payload-cms',
    },
    {
      description: 'Relational data and PostgreSQL.',
      isFeatured: false,
      name: 'PostgreSQL',
      slug: 'postgresql',
    },
    {
      description: 'Containers and reproducible environments.',
      isFeatured: false,
      name: 'Docker',
      slug: 'docker',
    },
  ]
  const tags = await Promise.all(tagInputs.map((input) => upsertTag(payload, input)))

  const existingSeries = await payload.find({
    collection: 'series',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: 'building-a-content-platform' } },
  })
  const seriesData = {
    author: author.id,
    description: 'A practical path from CMS schema to a safe public read model.',
    isActive: true,
    slug: 'building-a-content-platform',
    title: 'Building a Content Platform',
  }
  const series = existingSeries.docs[0]
    ? await payload.update({
        collection: 'series',
        context: seedContext,
        data: seriesData,
        id: existingSeries.docs[0].id,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'series',
        context: seedContext,
        data: seriesData,
        overrideAccess: true,
      })

  const posts = await Promise.all([
    upsertPost(payload, {
      author: author.id,
      category: architecture.id,
      excerpt:
        'Learn how a modular monolith keeps one deployment simple while preserving clear ownership boundaries.',
      featured: true,
      paragraphs: [
        'A modular monolith is one deployable system with deliberately separated responsibilities.',
        'The useful boundary is the contract: public content queries do not expose database documents directly.',
      ],
      series: series.id,
      seriesOrder: 1,
      slug: 'modular-monolith-first',
      status: 'published',
      tags: [tags[0].id, tags[1].id, tags[2].id],
      title: 'Start with a Modular Monolith',
    }),
    upsertPost(payload, {
      author: author.id,
      category: tooling.id,
      excerpt:
        'See why generated Payload types, strict TypeScript, and focused projections make public rendering safer.',
      featured: false,
      paragraphs: [
        'Generated types describe the persistence model, but public views should use narrower projection types.',
        'That distinction prevents authentication fields and draft state from reaching rendering components.',
      ],
      series: series.id,
      seriesOrder: 2,
      slug: 'safe-public-payload-queries',
      status: 'published',
      tags: [tags[0].id, tags[2].id, tags[3].id],
      title: 'Design Safe Public Payload Queries',
    }),
    upsertPost(payload, {
      author: author.id,
      category: operations.id,
      excerpt:
        'A draft article used to prove that unpublished content never crosses the public query boundary.',
      featured: false,
      paragraphs: [
        'This post intentionally remains a draft.',
        'Public lists, direct lookups, search, sitemap, and RSS must not expose it.',
      ],
      series: series.id,
      seriesOrder: 3,
      slug: 'draft-publication-boundary',
      status: 'draft',
      tags: [tags[2].id, tags[4].id],
      title: 'Testing the Draft Publication Boundary',
    }),
  ])

  await payload.updateGlobal({
    context: seedContext,
    data: {
      defaultAuthor: author.id,
      defaultSeoDescription: 'Practical engineering notes for people who build software.',
      defaultSeoTitle: 'Zi-Blog Technology Notes',
      enableDarkMode: true,
      postsPerPage: 10,
      siteDescription: 'Practical engineering notes for people who build software.',
      siteName: 'Zi-Blog',
      siteUrl: env.SERVER_URL,
    },
    overrideAccess: true,
    slug: 'site-settings',
  })

  await payload.updateGlobal({
    context: seedContext,
    data: {
      footerLinks: [
        {
          label: 'Posts',
          reference: { relationTo: 'posts', value: posts[0].id },
          type: 'internal',
        },
        { label: 'Search', type: 'external', url: `${env.SERVER_URL}/search` },
      ],
      footerText: 'Practical engineering notes for people who build software.',
      headerLinks: [
        {
          label: 'Featured',
          reference: { relationTo: 'posts', value: posts[0].id },
          type: 'internal',
        },
        {
          label: 'Architecture',
          reference: { relationTo: 'categories', value: architecture.id },
          type: 'internal',
        },
        {
          label: 'Series',
          reference: { relationTo: 'series', value: series.id },
          type: 'internal',
        },
      ],
    },
    overrideAccess: true,
    slug: 'navigation',
  })

  payload.logger.info({
    msg: 'Phase 1 seed completed',
    records: {
      administrator: administrator.id,
      categories: 3,
      posts: 3,
      tags: tags.length,
    },
  })
}
