import { Role } from '../entities/role.entity'

export interface RoleRepository {
  findAll(): Promise<Role[]>
  findById(id: number): Promise<Role | null>
  findByIds(ids: number[]): Promise<Role[]>
  findByName(name: string): Promise<Role | null>
  create(role: Role): Promise<Role>
  update(role: Role): Promise<Role>
  remove(id: number): Promise<Role | null>
  nextId(): Promise<number>
}

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY'
