import type { CollectionBeforeChangeHook } from 'payload'

import { getActor } from '@/modules/identity'

const AUTHOR_PROFILE_FIELDS = new Set(['avatar', 'bio', 'displayName', 'expertise', 'socialLinks'])

function isSeedRequest(context: unknown): boolean {
  return Boolean(context && typeof context === 'object' && 'seed' in context && context.seed)
}

export const protectUserFields: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (isSeedRequest(req.context)) return data

  const actor = getActor(req.user)
  if (!actor) throw new Error('Authentication is required to manage users')

  if (actor.role === 'editor' && data.role === 'super_admin') {
    throw new Error('Editors cannot create or promote a super administrator')
  }

  if (actor.role === 'author' && operation === 'update') {
    const changedFields = Object.keys(data).filter((field) => data[field] !== originalDoc?.[field])
    const disallowed = changedFields.filter((field) => !AUTHOR_PROFILE_FIELDS.has(field))
    if (disallowed.length > 0) {
      throw new Error(`Authors cannot update protected user fields: ${disallowed.join(', ')}`)
    }
  }

  return data
}
