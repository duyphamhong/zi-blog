import type { Actor } from './roles'

const AUTHOR_PROFILE_FIELDS = new Set(['avatar', 'bio', 'displayName', 'expertise', 'socialLinks'])
const FIRST_REGISTER_PATH = '/api/users/first-register'

type UserMutationData = Record<string, unknown>

type ProtectUserMutationFieldsInput = {
  actor: Actor | null
  data: UserMutationData
  operation: 'create' | 'update'
  originalDoc?: UserMutationData | null
  requestPathname: string
}

function isFirstUserRegistrationPath(pathname: string): boolean {
  return pathname.replace(/\/+$/, '').endsWith(FIRST_REGISTER_PATH)
}

export function protectUserMutationFields({
  actor,
  data,
  operation,
  originalDoc,
  requestPathname,
}: ProtectUserMutationFieldsInput): UserMutationData {
  if (!actor) {
    if (operation === 'create' && isFirstUserRegistrationPath(requestPathname)) {
      return {
        ...data,
        role: 'super_admin',
        status: 'active',
      }
    }

    throw new Error('Authentication is required to manage users')
  }

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
