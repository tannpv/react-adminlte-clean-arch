import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { Role } from '../../../domain/entities/role.entity'
import { RoleRepository } from '../../../domain/repositories/role.repository'
import { MysqlDatabaseService } from './mysql-database.service'

interface RoleRow extends RowDataPacket {
  id: number
  name: string
}

interface AutoIncrementRow extends RowDataPacket {
  AUTO_INCREMENT: number
}

interface RolePermissionRow extends RowDataPacket {
  permission: string
}

@Injectable()
export class MysqlRoleRepository implements RoleRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(): Promise<Role[]> {
    const [rows] = await this.db.execute<RoleRow[]>(
      'SELECT id, name FROM roles ORDER BY id ASC',
    )
    return Promise.all(rows.map((row) => this.hydrateRole(row)))
  }

  async findById(id: number): Promise<Role | null> {
    const [rows] = await this.db.execute<RoleRow[]>(
      'SELECT id, name FROM roles WHERE id = ? LIMIT 1',
      [id],
    )
    if (!rows.length) return null
    return this.hydrateRole(rows[0])
  }

  async findByIds(ids: number[]): Promise<Role[]> {
    if (!ids.length) return []
    const placeholders = ids.map(() => '?').join(', ')
    const [rows] = await this.db.execute<RoleRow[]>(
      `SELECT id, name FROM roles WHERE id IN (${placeholders})`,
      ids,
    )
    return Promise.all(rows.map((row) => this.hydrateRole(row)))
  }

  async findByName(name: string): Promise<Role | null> {
    const [rows] = await this.db.execute<RoleRow[]>(
      'SELECT id, name FROM roles WHERE LOWER(name) = LOWER(?) LIMIT 1',
      [name],
    )
    if (!rows.length) return null
    return this.hydrateRole(rows[0])
  }

  async create(role: Role): Promise<Role> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO roles (name) VALUES (?)',
      [role.name],
    )
    const id = result.insertId as number
    await this.replacePermissions(id, role.permissions)
    return new Role(id, role.name, [...role.permissions])
  }

  async update(role: Role): Promise<Role> {
    await this.db.execute('UPDATE roles SET name = ? WHERE id = ?', [role.name, role.id])
    await this.replacePermissions(role.id, role.permissions)
    return role.clone()
  }

  async remove(id: number): Promise<Role | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    await this.db.execute('DELETE FROM roles WHERE id = ?', [id])
    return existing
  }

  async nextId(): Promise<number> {
    const database = this.db.getDatabaseName()
    const [rows] = await this.db.execute<AutoIncrementRow[]>(
      `SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'roles'`,
      [database],
    )
    const nextId = rows[0]?.AUTO_INCREMENT
    return nextId ? Number(nextId) : 1
  }

  private async hydrateRole(row: RoleRow): Promise<Role> {
    const [permissionRows] = await this.db.execute<RolePermissionRow[]>(
      'SELECT permission FROM role_permissions WHERE role_id = ? ORDER BY permission ASC',
      [row.id],
    )
    const permissions = permissionRows.map((perm) => perm.permission)
    return new Role(row.id, row.name, permissions)
  }

  private async replacePermissions(roleId: number, permissions: string[]): Promise<void> {
    await this.db.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId])
    if (!permissions || !permissions.length) return
    const uniquePermissions = [...new Set(permissions)]
    const placeholders = uniquePermissions.map(() => '(?, ?)').join(', ')
    const params = uniquePermissions.flatMap((perm) => [roleId, perm])
    await this.db.execute(
      `INSERT INTO role_permissions (role_id, permission) VALUES ${placeholders}`,
      params,
    )
  }
}
