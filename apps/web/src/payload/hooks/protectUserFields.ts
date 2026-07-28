import type { CollectionBeforeChangeHook } from 'payload'

import { getActor, protectUserMutationFields } from '@/modules/identity'

function isSeedRequest(context: unknown): boolean {
  return Boolean(context && typeof context === 'object' && 'seed' in context && context.seed)
}

function getRequestPathname(url: string | undefined): string {
  if (!url) return ''

  try {
    return new URL(url).pathname
  } catch {
    return ''
  }
}

export const protectUserFields: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (isSeedRequest(req.context)) return data

  return protectUserMutationFields({
    actor: getActor(req.user),
    data,
    operation,
    originalDoc,
    requestPathname: getRequestPathname(req.url),
  })
}
