import { Injectable } from '@nestjs/common'
import { Role } from '../../../domain/entities/role.entity'
import { RoleRepository } from '../../../domain/repositories/role.repository'
import { FileDatabaseService, RawRole } from './file-database.service'

@Injectable()
export class FileRoleRepository implements RoleRepository {
  constructor(private readonly db: FileDatabaseService) {}

  async findAll(): Promise<Role[]> {
    const data = await this.db.read()
    return data.roles.map((role) => this.toDomain(role))
  }

  async findById(id: number): Promise<Role | null> {
    const data = await this.db.read()
    const raw = data.roles.find((role) => role.id === id)
    return raw ? this.toDomain(raw) : null
  }

  async findByIds(ids: number[]): Promise<Role[]> {
    if (!ids.length) return []
    const data = await this.db.read()
    const idSet = new Set(ids)
    return data.roles.filter((role) => idSet.has(role.id)).map((role) => this.toDomain(role))
  }

  async findByName(name: string): Promise<Role | null> {
    const target = name.toLowerCase()
    const data = await this.db.read()
    const raw = data.roles.find((role) => role.name.toLowerCase() === target)
    return raw ? this.toDomain(raw) : null
  }

  async create(role: Role): Promise<Role> {
    await this.db.update(async (db) => {
      db.roles.push(this.toRaw(role))
    })
    return role
  }

  async update(role: Role): Promise<Role> {
    await this.db.update(async (db) => {
      const idx = db.roles.findIndex((item) => item.id === role.id)
      if (idx === -1) return
      db.roles[idx] = this.toRaw(role)
    })
    return role
  }

  async remove(id: number): Promise<Role | null> {
    let removed: Role | null = null
    await this.db.update(async (db) => {
      const idx = db.roles.findIndex((item) => item.id === id)
      if (idx === -1) return
      const [raw] = db.roles.splice(idx, 1)
      removed = this.toDomain(raw)
    })
    return removed
  }

  async nextId(): Promise<number> {
    const data = await this.db.read()
    const max = data.roles.reduce((acc, role) => (role.id > acc ? role.id : acc), 0)
    return max + 1
  }

  private toDomain(raw: RawRole): Role {
    const permissions = Array.isArray(raw.permissions) ? [...new Set(raw.permissions)] : []
    return new Role(raw.id, raw.name, permissions)
  }

  private toRaw(role: Role): RawRole {
    return {
      id: role.id,
      name: role.name,
      permissions: [...role.permissions],
    }
  }
}
