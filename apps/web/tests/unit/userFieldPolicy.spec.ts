import { describe, expect, it } from 'vitest'

import { protectUserMutationFields } from '@/modules/identity'

describe('user field policy', () => {
  it('allows Payload first registration and creates an active super administrator', () => {
    const data = protectUserMutationFields({
      actor: null,
      data: {
        displayName: 'Administrator',
        email: 'admin@example.com',
        role: 'author',
        status: 'disabled',
      },
      operation: 'create',
      requestPathname: '/api/users/first-register',
    })

    expect(data).toMatchObject({
      displayName: 'Administrator',
      email: 'admin@example.com',
      role: 'super_admin',
      status: 'active',
    })
  })

  it('accepts a trailing slash on the first-registration endpoint', () => {
    expect(
      protectUserMutationFields({
        actor: null,
        data: { email: 'admin@example.com' },
        operation: 'create',
        requestPathname: '/api/users/first-register/',
      }),
    ).toMatchObject({
      role: 'super_admin',
      status: 'active',
    })
  })

  it('rejects anonymous user creation outside first registration', () => {
    expect(() =>
      protectUserMutationFields({
        actor: null,
        data: { email: 'author@example.com' },
        operation: 'create',
        requestPathname: '/api/users',
      }),
    ).toThrow('Authentication is required to manage users')
  })

  it('keeps editor and author field protections in place', () => {
    expect(() =>
      protectUserMutationFields({
        actor: { id: 1, role: 'editor', status: 'active' },
        data: { role: 'super_admin' },
        operation: 'update',
        originalDoc: { role: 'author' },
        requestPathname: '/api/users/2',
      }),
    ).toThrow('Editors cannot create or promote a super administrator')

    expect(() =>
      protectUserMutationFields({
        actor: { id: 2, role: 'author', status: 'active' },
        data: { role: 'editor' },
        operation: 'update',
        originalDoc: { role: 'author' },
        requestPathname: '/api/users/2',
      }),
    ).toThrow('Authors cannot update protected user fields: role')
  })
})
