import { Role } from '../entities/role.entity';

export interface RoleRepositoryInterface {
  findAll(): Promise<Role[]>;
  findById(id: number): Promise<Role | null>;
  findByIds(ids: number[]): Promise<Role[]>;
  findByName(name: string): Promise<Role | null>;
  create(role: Partial<Role>): Promise<Role>;
  update(id: number, role: Partial<Role>): Promise<Role>;
  delete(id: number): Promise<void>;
  findActive(): Promise<Role[]>;
  findByPermission(permission: string): Promise<Role[]>;
  count(): Promise<number>;
  existsByName(name: string): Promise<boolean>;
}
