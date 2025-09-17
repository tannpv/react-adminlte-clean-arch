import { Permission } from '../domain/value-objects/permission.type'

export const DEFAULT_ADMIN_PERMISSIONS: Permission[] = [
  'users:read',
  'users:create',
  'users:update',
  'users:delete',
  'roles:read',
  'roles:create',
  'roles:update',
  'roles:delete',
]

export const DEFAULT_USER_PERMISSIONS: Permission[] = ['users:read']

export const DEFAULT_JWT_SECRET = 'dev_secret_change_me'

export const DEFAULT_USER_PASSWORD = 'secret'
