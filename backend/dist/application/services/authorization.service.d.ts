import { RoleRepository } from '../../domain/repositories/role.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
export declare class AuthorizationService {
    private readonly users;
    private readonly roles;
    private readonly permissionCache;
    constructor(users: UserRepository, roles: RoleRepository);
    hasPermission(userId: number, permission: string): Promise<boolean>;
    hasAnyPermission(userId: number, perms: string[]): Promise<boolean>;
    getPermissions(userId: number): Promise<Set<string>>;
    evictPermissionsForUser(userId: number): void;
    evictAllPermissions(): void;
}
