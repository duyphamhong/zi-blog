import { localePath, parseContentLocale, type ContentLocale } from '@/modules/platform'
import { getPayloadClient } from '@/shared/payload/client'

type LocalizedCollection = 'categories' | 'posts' | 'series' | 'tags'

const routeCollections: Record<string, LocalizedCollection> = {
  categories: 'categories',
  posts: 'posts',
  series: 'series',
  tags: 'tags',
}

function requiredField(collection: LocalizedCollection): 'name' | 'title' {
  return collection === 'categories' || collection === 'tags' ? 'name' : 'title'
}

export async function resolveAlternatePublicPath(input: {
  pathname: string
  targetLocale: ContentLocale
}): Promise<string | null> {
  const segments = input.pathname.split('/').filter(Boolean)
  const currentLocale = parseContentLocale(segments[0])
  if (!currentLocale) return null
  if (segments.length === 1) return localePath(input.targetLocale)

  const route = segments[1]
  if (route === 'authors' && segments[2]) {
    return localePath(input.targetLocale, `/authors/${segments[2]}`)
  }
  if (!segments[2] || !routeCollections[route]) {
    return localePath(input.targetLocale, `/${segments.slice(1).join('/')}`)
  }

  const collection = routeCollections[route]
  const payload = await getPayloadClient()
  const current = await payload.find({
    collection,
    depth: 0,
    fallbackLocale: false,
    limit: 1,
    locale: currentLocale,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: segments[2] } },
  })
  const document = current.docs[0]
  if (!document) return null
  const alternate = await payload.findByID({
    collection,
    depth: 0,
    fallbackLocale: false,
    id: document.id,
    locale: input.targetLocale,
    overrideAccess: true,
  })
  const titleField = requiredField(collection)
  const alternateRecord = alternate as unknown as Record<string, unknown>
  const title = alternateRecord[titleField]
  if (!alternate.slug || typeof title !== 'string' || !title.trim()) return null
  if ('_status' in alternate && alternate._status !== 'published') return null
  if ('isActive' in alternate && alternate.isActive !== true) return null
  return localePath(input.targetLocale, `/${route}/${alternate.slug}`)
}

export async function resolveLegacyPublicPath(input: {
  route: keyof typeof routeCollections
  slug: string
}): Promise<string | null> {
  for (const locale of ['vi', 'en'] as const) {
    const candidate = await resolveAlternatePublicPath({
      pathname: `/${locale}/${input.route}/${input.slug}`,
      targetLocale: locale,
    })
    if (candidate) return candidate
  }
  return null
}
