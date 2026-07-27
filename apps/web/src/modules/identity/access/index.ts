import type { Access, Where } from 'payload'

import { canPublish, getActor, isActiveStaff, isEditor, isSuperAdmin } from '../roles'

export const authenticated: Access = ({ req }) => isActiveStaff(req.user)

export const editorOrSuperAdmin: Access = ({ req }) => canPublish(req.user)

export const superAdminOnly: Access = ({ req }) => isSuperAdmin(req.user)

export const userReadAccess: Access = ({ req }) => isActiveStaff(req.user)

export const userCreateAccess: Access = ({ req }) => isSuperAdmin(req.user) || isEditor(req.user)

export const userUpdateAccess: Access = ({ req }) => {
  const actor = getActor(req.user)
  if (!actor || actor.status === 'disabled') return false
  if (actor.role === 'super_admin') return true
  if (actor.role === 'editor') {
    const where: Where = {
      role: {
        not_equals: 'super_admin',
      },
    }
    return where
  }
  const where: Where = {
    id: {
      equals: actor.id,
    },
  }
  return where
}

export const postReadAccess: Access = ({ req }) => {
  const actor = getActor(req.user)
  if (actor?.role === 'super_admin' || actor?.role === 'editor') return true
  if (actor?.role === 'author' && actor.status !== 'disabled') {
    const where: Where = {
      author: {
        equals: actor.id,
      },
    }
    return where
  }
  const where: Where = {
    and: [
      {
        _status: {
          equals: 'published',
        },
      },
      {
        visibility: {
          equals: 'public',
        },
      },
    ],
  }
  return where
}

export const postCreateAccess: Access = ({ req }) => isActiveStaff(req.user)

export const postUpdateAccess: Access = ({ req }) => {
  const actor = getActor(req.user)
  if (!actor || actor.status === 'disabled') return false
  if (actor.role === 'super_admin' || actor.role === 'editor') return true
  const where: Where = {
    and: [
      {
        author: {
          equals: actor.id,
        },
      },
      {
        _status: {
          equals: 'draft',
        },
      },
    ],
  }
  return where
}

export const postDeleteAccess: Access = ({ req }) => canPublish(req.user)

export const mediaMutationAccess: Access = ({ req }) => isActiveStaff(req.user)

export const mediaUpdateOrDeleteAccess: Access = ({ req }) => {
  const actor = getActor(req.user)
  if (!actor || actor.status === 'disabled') return false
  if (actor.role === 'super_admin' || actor.role === 'editor') return true
  const where: Where = {
    uploadedBy: {
      equals: actor.id,
    },
  }
  return where
}

export const activeCategoryReadAccess: Access = ({ req }) => {
  if (isActiveStaff(req.user)) return true
  const where: Where = {
    isActive: {
      equals: true,
    },
  }
  return where
}

export const activeSeriesReadAccess: Access = ({ req }) => {
  if (isActiveStaff(req.user)) return true
  const where: Where = {
    isActive: {
      equals: true,
    },
  }
  return where
}
