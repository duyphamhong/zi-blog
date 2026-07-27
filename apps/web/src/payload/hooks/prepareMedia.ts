import type { CollectionBeforeChangeHook } from 'payload'

import { getActor } from '@/modules/identity'

export const prepareMedia: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create' || data.uploadedBy) return data
  const actor = getActor(req.user)
  if (actor) data.uploadedBy = actor.id
  return data
}
