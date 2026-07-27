import type { CollectionBeforeChangeHook } from 'payload'

function relationId(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return null
}

export const validateCategoryParent: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const categoryId = relationId(originalDoc)
  const parentId = relationId(data.parent)
  if (!parentId) return data
  if (categoryId && parentId === categoryId) {
    throw new Error('A category cannot be its own parent')
  }

  const parent = await req.payload.findByID({
    collection: 'categories',
    id: parentId,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (parent.parent) {
    throw new Error('Phase 1 categories support at most one parent level')
  }
  return data
}
