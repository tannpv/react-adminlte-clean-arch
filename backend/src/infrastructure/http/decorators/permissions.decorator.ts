import { SetMetadata } from '@nestjs/common'

export const PERMISSIONS_METADATA_KEY = 'permissions'

export interface PermissionRequirement {
  all?: string[]
  any?: string[]
}

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_METADATA_KEY, { all: permissions } satisfies PermissionRequirement)

export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_METADATA_KEY, { any: permissions } satisfies PermissionRequirement)
