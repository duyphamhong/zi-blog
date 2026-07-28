import type { Payload } from 'payload'

import { env } from '@/config/env'
import type { ContentLocale } from '@/modules/platform'
import { enDictionary } from '@/modules/platform/i18n/dictionaries/en'
import { viDictionary } from '@/modules/platform/i18n/dictionaries/vi'

import { lexicalDocument } from './content'

const seedContext = { seed: true, skipRevalidation: true }
type Localized<T> = Record<ContentLocale, T>

async function findLocalizedDocumentId(
  payload: Payload,
  collection: 'categories' | 'posts' | 'series' | 'tags',
  slugs: Localized<string>,
  draft = false,
): Promise<number | null> {
  for (const locale of ['vi', 'en'] as const) {
    const result = await payload.find({
      collection,
      depth: 0,
      draft,
      fallbackLocale: false,
      limit: 1,
      locale,
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: slugs[locale] } },
    })
    const id = result.docs[0]?.id
    if (typeof id === 'number') return id
  }
  return null
}

async function upsertUser(
  payload: Payload,
  input: {
    bio?: Localized<string>
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
  const base = {
    displayName: input.displayName,
    email: input.email,
    password: input.password,
    role: input.role,
    status: 'active' as const,
    username: input.username,
  }
  const user = existing.docs[0]
    ? await payload.update({
        collection: 'users',
        context: seedContext,
        data: { ...base, bio: input.bio?.vi },
        id: existing.docs[0].id,
        locale: 'vi',
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'users',
        context: seedContext,
        data: { ...base, bio: input.bio?.vi },
        locale: 'vi',
        overrideAccess: true,
      })
  if (input.bio) {
    await payload.update({
      collection: 'users',
      context: seedContext,
      data: { bio: input.bio.en },
      id: user.id,
      locale: 'en',
      overrideAccess: true,
    })
  }
  return user
}

async function upsertCategory(
  payload: Payload,
  input: Localized<{ description: string; name: string; slug: string }> & {
    displayOrder: number
  },
) {
  const existingId = await findLocalizedDocumentId(payload, 'categories', {
    en: input.en.slug,
    vi: input.vi.slug,
  })
  const shared = { displayOrder: input.displayOrder, isActive: true }
  const category = existingId
    ? await payload.update({
        collection: 'categories',
        context: seedContext,
        data: { ...shared, ...input.vi },
        id: existingId,
        locale: 'vi',
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'categories',
        context: seedContext,
        data: { ...shared, ...input.vi },
        locale: 'vi',
        overrideAccess: true,
      })
  await payload.update({
    collection: 'categories',
    context: seedContext,
    data: input.en,
    id: category.id,
    locale: 'en',
    overrideAccess: true,
  })
  return category
}

async function upsertTag(
  payload: Payload,
  input: Localized<{ description: string; name: string; slug: string }> & {
    isFeatured: boolean
  },
) {
  const existingId = await findLocalizedDocumentId(payload, 'tags', {
    en: input.en.slug,
    vi: input.vi.slug,
  })
  const tag = existingId
    ? await payload.update({
        collection: 'tags',
        context: seedContext,
        data: { ...input.vi, isFeatured: input.isFeatured },
        id: existingId,
        locale: 'vi',
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'tags',
        context: seedContext,
        data: { ...input.vi, isFeatured: input.isFeatured },
        locale: 'vi',
        overrideAccess: true,
      })
  await payload.update({
    collection: 'tags',
    context: seedContext,
    data: input.en,
    id: tag.id,
    locale: 'en',
    overrideAccess: true,
  })
  return tag
}

type LocalizedPostInput = Localized<{
  excerpt: string
  paragraphs: string[]
  slug: string
  title: string
}> & {
  author: number
  category: number
  featured: boolean
  series: number
  seriesOrder: number
  status: 'draft' | 'published'
  tags: number[]
}

async function upsertPost(payload: Payload, input: LocalizedPostInput) {
  const existingId = await findLocalizedDocumentId(
    payload,
    'posts',
    { en: input.en.slug, vi: input.vi.slug },
    true,
  )
  const localizedData = (locale: ContentLocale) => ({
    content: lexicalDocument(input[locale].paragraphs),
    excerpt: input[locale].excerpt,
    slug: input[locale].slug,
    title: input[locale].title,
  })
  const shared = {
    _status: input.status,
    author: input.author,
    category: input.category,
    featured: input.featured,
    series: input.series,
    seriesOrder: input.seriesOrder,
    tags: input.tags,
    visibility: 'public' as const,
  }
  const post = existingId
    ? await payload.update({
        collection: 'posts',
        context: seedContext,
        data: { ...shared, ...localizedData('vi') },
        draft: input.status === 'draft',
        id: existingId,
        locale: 'vi',
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'posts',
        context: seedContext,
        data: { ...shared, ...localizedData('vi') },
        draft: input.status === 'draft',
        locale: 'vi',
        overrideAccess: true,
      })
  await payload.update({
    collection: 'posts',
    context: seedContext,
    data: localizedData('en'),
    draft: input.status === 'draft',
    id: post.id,
    locale: 'en',
    overrideAccess: true,
  })
  return post
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
    bio: {
      en: 'Engineers sharing practical lessons from building content platforms.',
      vi: 'Nhóm kỹ sư chia sẻ bài học thực tiễn khi xây dựng nền tảng nội dung.',
    },
    displayName: 'Zi-Blog Engineering',
    email: 'author@example.com',
    password: env.SEED_ADMIN_PASSWORD,
    role: 'author',
    username: 'zi-blog-engineering',
  })

  const [architecture, tooling, operations] = await Promise.all([
    upsertCategory(payload, {
      displayOrder: 1,
      en: {
        description: 'System design, trade-offs, and maintainable boundaries.',
        name: 'Architecture',
        slug: 'architecture',
      },
      vi: {
        description: 'Thiết kế hệ thống, đánh đổi và ranh giới dễ bảo trì.',
        name: 'Kiến trúc',
        slug: 'kien-truc',
      },
    }),
    upsertCategory(payload, {
      displayOrder: 2,
      en: {
        description: 'Developer tools and productive engineering workflows.',
        name: 'Tooling',
        slug: 'tooling',
      },
      vi: {
        description: 'Công cụ phát triển và quy trình kỹ thuật hiệu quả.',
        name: 'Công cụ',
        slug: 'cong-cu',
      },
    }),
    upsertCategory(payload, {
      displayOrder: 3,
      en: {
        description: 'Running and improving software in real environments.',
        name: 'Operations',
        slug: 'operations',
      },
      vi: {
        description: 'Vận hành và cải tiến phần mềm trong môi trường thực tế.',
        name: 'Vận hành',
        slug: 'van-hanh',
      },
    }),
  ])

  const tagInputs = [
    {
      en: {
        description: 'Type-safe application development.',
        name: 'TypeScript',
        slug: 'typescript',
      },
      isFeatured: true,
      vi: {
        description: 'Phát triển ứng dụng an toàn kiểu dữ liệu.',
        name: 'TypeScript',
        slug: 'typescript',
      },
    },
    {
      en: {
        description: 'React applications with the App Router.',
        name: 'Next.js',
        slug: 'nextjs',
      },
      isFeatured: true,
      vi: { description: 'Ứng dụng React với App Router.', name: 'Next.js', slug: 'nextjs' },
    },
    {
      en: {
        description: 'Content infrastructure with Payload.',
        name: 'Payload CMS',
        slug: 'payload-cms',
      },
      isFeatured: true,
      vi: {
        description: 'Hạ tầng nội dung với Payload.',
        name: 'Payload CMS',
        slug: 'payload-cms',
      },
    },
    {
      en: {
        description: 'Relational data and PostgreSQL.',
        name: 'PostgreSQL',
        slug: 'postgresql',
      },
      isFeatured: false,
      vi: { description: 'Dữ liệu quan hệ và PostgreSQL.', name: 'PostgreSQL', slug: 'postgresql' },
    },
    {
      en: {
        description: 'Containers and reproducible environments.',
        name: 'Docker',
        slug: 'docker',
      },
      isFeatured: false,
      vi: {
        description: 'Container và môi trường có thể tái tạo.',
        name: 'Docker',
        slug: 'docker',
      },
    },
  ] satisfies Array<Parameters<typeof upsertTag>[1]>
  const tags = await Promise.all(tagInputs.map((input) => upsertTag(payload, input)))

  const existingSeriesId = await findLocalizedDocumentId(payload, 'series', {
    en: 'building-a-content-platform',
    vi: 'xay-dung-nen-tang-noi-dung',
  })
  const series = existingSeriesId
    ? await payload.update({
        collection: 'series',
        context: seedContext,
        data: {
          author: author.id,
          description: 'Lộ trình thực tiễn từ lược đồ CMS đến mô hình đọc công khai an toàn.',
          isActive: true,
          slug: 'xay-dung-nen-tang-noi-dung',
          title: 'Xây dựng nền tảng nội dung',
        },
        id: existingSeriesId,
        locale: 'vi',
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'series',
        context: seedContext,
        data: {
          author: author.id,
          description: 'Lộ trình thực tiễn từ lược đồ CMS đến mô hình đọc công khai an toàn.',
          isActive: true,
          slug: 'xay-dung-nen-tang-noi-dung',
          title: 'Xây dựng nền tảng nội dung',
        },
        locale: 'vi',
        overrideAccess: true,
      })
  await payload.update({
    collection: 'series',
    context: seedContext,
    data: {
      description: 'A practical path from CMS schema to a safe public read model.',
      slug: 'building-a-content-platform',
      title: 'Building a Content Platform',
    },
    id: series.id,
    locale: 'en',
    overrideAccess: true,
  })

  const posts = await Promise.all([
    upsertPost(payload, {
      author: author.id,
      category: architecture.id,
      en: {
        excerpt:
          'Learn how a modular monolith keeps one deployment simple while preserving clear ownership boundaries.',
        paragraphs: [
          'A modular monolith is one deployable system with deliberately separated responsibilities.',
          'The useful boundary is the contract: public content queries do not expose database documents directly.',
        ],
        slug: 'modular-monolith-first',
        title: 'Start with a Modular Monolith',
      },
      featured: true,
      series: series.id,
      seriesOrder: 1,
      status: 'published',
      tags: [tags[0].id, tags[1].id, tags[2].id],
      vi: {
        excerpt:
          'Tìm hiểu cách Modular Monolith giữ việc triển khai đơn giản mà vẫn duy trì ranh giới sở hữu rõ ràng.',
        paragraphs: [
          'Modular Monolith là một hệ thống triển khai duy nhất với các trách nhiệm được phân tách có chủ đích.',
          'Ranh giới hữu ích nằm ở hợp đồng: truy vấn nội dung công khai không trả tài liệu cơ sở dữ liệu trực tiếp.',
        ],
        slug: 'bat-dau-voi-modular-monolith',
        title: 'Bắt đầu với Modular Monolith',
      },
    }),
    upsertPost(payload, {
      author: author.id,
      category: tooling.id,
      en: {
        excerpt:
          'See why generated Payload types, strict TypeScript, and focused projections make public rendering safer.',
        paragraphs: [
          'Generated types describe persistence, while public views use narrower projection types.',
          'That distinction prevents authentication fields and draft state from reaching rendering components.',
        ],
        slug: 'safe-public-payload-queries',
        title: 'Design Safe Public Payload Queries',
      },
      featured: false,
      series: series.id,
      seriesOrder: 2,
      status: 'published',
      tags: [tags[0].id, tags[2].id, tags[3].id],
      vi: {
        excerpt:
          'Khám phá cách kiểu Payload sinh tự động, TypeScript nghiêm ngặt và phép chiếu tập trung giúp hiển thị an toàn hơn.',
        paragraphs: [
          'Kiểu dữ liệu sinh tự động mô tả lớp lưu trữ, còn giao diện công khai dùng phép chiếu hẹp hơn.',
          'Sự phân tách này ngăn trường xác thực và trạng thái nháp đi vào thành phần hiển thị.',
        ],
        slug: 'thiet-ke-truy-van-payload-cong-khai-an-toan',
        title: 'Thiết kế truy vấn Payload công khai an toàn',
      },
    }),
    upsertPost(payload, {
      author: author.id,
      category: operations.id,
      en: {
        excerpt:
          'A draft article used to prove that unpublished content never crosses the public query boundary.',
        paragraphs: [
          'This post intentionally remains a draft.',
          'Public queries must not expose it.',
        ],
        slug: 'draft-publication-boundary',
        title: 'Testing the Draft Publication Boundary',
      },
      featured: false,
      series: series.id,
      seriesOrder: 3,
      status: 'draft',
      tags: [tags[2].id, tags[4].id],
      vi: {
        excerpt:
          'Bài nháp dùng để chứng minh nội dung chưa xuất bản không bao giờ vượt qua ranh giới truy vấn công khai.',
        paragraphs: [
          'Bài viết này được giữ ở trạng thái nháp.',
          'Truy vấn công khai không được phép hiển thị nó.',
        ],
        slug: 'kiem-thu-ranh-gioi-xuat-ban-ban-nhap',
        title: 'Kiểm thử ranh giới xuất bản bản nháp',
      },
    }),
  ])

  for (const locale of ['vi', 'en'] as const) {
    const localizedDictionary = locale === 'vi' ? viDictionary : enDictionary
    await payload.updateGlobal({
      context: seedContext,
      data: {
        defaultAuthor: author.id,
        defaultSeoDescription: localizedDictionary.site.defaultSeoDescription,
        defaultSeoTitle: localizedDictionary.site.defaultSeoTitle,
        enableDarkMode: true,
        postsPerPage: 10,
        siteDescription: localizedDictionary.site.description,
        siteName: localizedDictionary.site.name,
        siteUrl: env.SERVER_URL,
      },
      locale,
      overrideAccess: true,
      slug: 'site-settings',
    })
    await payload.updateGlobal({
      context: seedContext,
      data: {
        footerLinks: [
          {
            label: localizedDictionary.navigation.posts,
            reference: { relationTo: 'posts', value: posts[0].id },
            type: 'internal',
          },
          {
            label: localizedDictionary.navigation.search,
            type: 'external',
            url: `${env.SERVER_URL}/${locale}/search`,
          },
        ],
        footerText: localizedDictionary.footer.content,
        headerLinks: [
          {
            label: localizedDictionary.navigation.featured,
            reference: { relationTo: 'posts', value: posts[0].id },
            type: 'internal',
          },
          {
            label: localizedDictionary.navigation.architecture,
            reference: { relationTo: 'categories', value: architecture.id },
            type: 'internal',
          },
          {
            label: localizedDictionary.navigation.series,
            reference: { relationTo: 'series', value: series.id },
            type: 'internal',
          },
        ],
      },
      locale,
      overrideAccess: true,
      slug: 'navigation',
    })
  }

  payload.logger.info({
    msg: 'Phase 2 bilingual seed completed',
    records: { administrator: administrator.id, categories: 3, posts: 3, tags: tags.length },
  })
}
