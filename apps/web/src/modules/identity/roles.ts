export const roles = ['super_admin', 'editor', 'author'] as const

export type Role = (typeof roles)[number]

export type Actor = {
  id: number | string
  role?: Role | null
  status?: 'active' | 'disabled' | null
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && roles.includes(value as Role)
}

export function getActor(value: unknown): Actor | null {
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  const id = value.id
  if (typeof id !== 'string' && typeof id !== 'number') return null

  const role = 'role' in value && isRole(value.role) ? value.role : null
  const status =
    'status' in value && (value.status === 'active' || value.status === 'disabled')
      ? value.status
      : null

  return { id, role, status }
}

export function isSuperAdmin(value: unknown): boolean {
  return getActor(value)?.role === 'super_admin'
}

export function isEditor(value: unknown): boolean {
  return getActor(value)?.role === 'editor'
}

export function canPublish(value: unknown): boolean {
  const role = getActor(value)?.role
  return role === 'super_admin' || role === 'editor'
}

export function isActiveStaff(value: unknown): boolean {
  const actor = getActor(value)
  return Boolean(actor?.role && actor.status !== 'disabled')
}
