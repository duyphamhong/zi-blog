import type { CollectionConfig, FieldAccess } from 'payload'

import { isActiveStaff, isSuperAdmin } from '@/modules/identity'
import {
  superAdminOnly,
  userCreateAccess,
  userReadAccess,
  userUpdateAccess,
} from '@/modules/identity/access'
import { protectUserFields } from '@/payload/hooks/protectUserFields'

const superAdminFieldAccess: FieldAccess = ({ req }) => isSuperAdmin(req.user)

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    plural: { en: 'Users', vi: 'Người dùng' },
    singular: { en: 'User', vi: 'Người dùng' },
  },
  access: {
    admin: ({ req }) => isActiveStaff(req.user),
    create: userCreateAccess,
    delete: superAdminOnly,
    read: userReadAccess,
    update: userUpdateAccess,
  },
  admin: {
    defaultColumns: ['displayName', 'username', 'email', 'role', 'status'],
    useAsTitle: 'displayName',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  fields: [
    {
      name: 'username',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'displayName',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: { en: 'Biography', vi: 'Tiểu sử' },
      localized: true,
      maxLength: 800,
    },
    {
      name: 'role',
      type: 'select',
      access: {
        update: superAdminFieldAccess,
      },
      defaultValue: 'author',
      index: true,
      options: [
        { label: 'Super administrator', value: 'super_admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      access: {
        update: superAdminFieldAccess,
      },
      defaultValue: 'active',
      index: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled' },
      ],
      required: true,
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'website', type: 'text' },
        { name: 'github', type: 'text' },
        { name: 'linkedIn', type: 'text' },
      ],
    },
    {
      name: 'expertise',
      type: 'array',
      label: { en: 'Expertise', vi: 'Chuyên môn' },
      localized: true,
      maxRows: 12,
      fields: [{ name: 'topic', type: 'text', required: true }],
    },
  ],
  hooks: {
    beforeChange: [protectUserFields],
  },
  timestamps: true,
}
