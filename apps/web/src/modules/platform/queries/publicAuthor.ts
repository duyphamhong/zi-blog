import { unstable_cache } from 'next/cache'

import type { PublicAuthor } from '@/modules/content'
import { projectAuthor } from '@/modules/content/queries/projections'
import { cacheTags } from '@/modules/platform/cache/tags'
import { getPayloadClient } from '@/shared/payload/client'
import type { ContentLocale } from '@/modules/platform/i18n'

async function queryPublicAuthorProfile(
  locale: ContentLocale,
  username: string,
): Promise<PublicAuthor | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'users',
    depth: 1,
    fallbackLocale: false,
    limit: 1,
    locale,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [{ username: { equals: username } }, { status: { equals: 'active' } }],
    },
  })
  return result.docs[0] ? projectAuthor(result.docs[0]) : null
}

const getPublicAuthorProfileCached = unstable_cache(
  queryPublicAuthorProfile,
  ['public-author-profile'],
  { revalidate: 300, tags: [cacheTags.users] },
)

export async function getPublicAuthorProfile(input: {
  locale: ContentLocale
  username: string
}): Promise<PublicAuthor | null> {
  return getPublicAuthorProfileCached(input.locale, input.username)
}
