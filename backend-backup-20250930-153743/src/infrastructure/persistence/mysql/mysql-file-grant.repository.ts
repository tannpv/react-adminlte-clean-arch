import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { FileGrant, FileGrantAccess, FileGrantEntityType } from '../../../domain/entities/file-grant.entity'
import { FileGrantRepository } from '../../../domain/repositories/file-grant.repository'
import { MysqlDatabaseService } from './mysql-database.service'

interface GrantRow extends RowDataPacket {
  id: number
  entity_type: FileGrantEntityType
  entity_id: number
  role_id: number
  access: FileGrantAccess
}

@Injectable()
export class MysqlFileGrantRepository implements FileGrantRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findByEntity(entityType: FileGrantEntityType, entityId: number): Promise<FileGrant[]> {
    const [rows] = await this.db.execute<GrantRow[]>(
      'SELECT * FROM file_grants WHERE entity_type = ? AND entity_id = ?',
      [entityType, entityId],
    )
    return rows.map((row) => this.hydrate(row))
  }

  async findForRole(entityType: FileGrantEntityType, entityId: number, roleIds: number[]): Promise<FileGrant[]> {
    if (!roleIds.length) return []
    const placeholders = roleIds.map(() => '?').join(', ')
    const [rows] = await this.db.execute<GrantRow[]>(
      `SELECT * FROM file_grants WHERE entity_type = ? AND entity_id = ? AND role_id IN (${placeholders})`,
      [entityType, entityId, ...roleIds],
    )
    return rows.map((row) => this.hydrate(row))
  }

  async create(grant: FileGrant): Promise<FileGrant> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO file_grants (entity_type, entity_id, role_id, access) VALUES (?, ?, ?, ?)',
      [grant.entityType, grant.entityId, grant.roleId, grant.access],
    )
    const id = result.insertId as number
    return new FileGrant(id, grant.entityType, grant.entityId, grant.roleId, grant.access)
  }

  async remove(id: number): Promise<void> {
    await this.db.execute('DELETE FROM file_grants WHERE id = ?', [id])
  }

  async removeForEntity(entityType: FileGrantEntityType, entityId: number): Promise<void> {
    await this.db.execute('DELETE FROM file_grants WHERE entity_type = ? AND entity_id = ?', [entityType, entityId])
  }

  private hydrate(row: GrantRow): FileGrant {
    return new FileGrant(row.id, row.entity_type, row.entity_id, row.role_id, row.access)
  }
}

