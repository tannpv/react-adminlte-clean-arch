import { Inject, Injectable } from '@nestjs/common'
import { ROLE_REPOSITORY, RoleRepository } from '../../domain/repositories/role.repository'
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository'

@Injectable()
export class AuthorizationService {
  private readonly permissionCache = new Map<number, ReadonlySet<string>>()

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  async hasPermission(userId: number, permission: string): Promise<boolean> {
    const permissions = await this.getPermissions(userId)
    return permissions.has(permission)
  }

  async hasAnyPermission(userId: number, perms: string[]): Promise<boolean> {
    if (!perms.length) return true
    const permissions = await this.getPermissions(userId)
    return perms.some((perm) => permissions.has(perm))
  }

  async getPermissions(userId: number): Promise<Set<string>> {
    const cached = this.permissionCache.get(userId)
    if (cached) {
      return new Set(cached)
    }

    const user = await this.users.findById(userId)
    if (!user) return new Set()
    const roles = await this.roles.findByIds(user.roles)
    const permissions = new Set<string>()
    roles.forEach((role) => {
      ;(role.permissions || []).forEach((perm) => permissions.add(perm))
    })
    this.permissionCache.set(userId, permissions)
    return new Set(permissions)
  }

  evictPermissionsForUser(userId: number): void {
    this.permissionCache.delete(userId)
  }

  evictAllPermissions(): void {
    this.permissionCache.clear()
  }
}
