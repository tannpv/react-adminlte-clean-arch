import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { FileDirectory } from '../../../domain/entities/file-directory.entity'
import { FileDirectoryRepository } from '../../../domain/repositories/file-directory.repository'
import { MysqlDatabaseService } from './mysql-database.service'

interface DirectoryRow extends RowDataPacket {
  id: number
  owner_id: number
  parent_id: number | null
  name: string
  created_at: Date
  updated_at: Date
}

@Injectable()
export class MysqlFileDirectoryRepository implements FileDirectoryRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<FileDirectory | null> {
    const [rows] = await this.db.execute<DirectoryRow[]>(
      'SELECT * FROM file_directories WHERE id = ? LIMIT 1',
      [id],
    )
    if (!rows.length) return null
    return this.hydrate(rows[0])
  }

  async findByIds(ids: number[]): Promise<FileDirectory[]> {
    if (!ids.length) return []
    const placeholders = ids.map(() => '?').join(', ')
    const [rows] = await this.db.execute<DirectoryRow[]>(
      `SELECT * FROM file_directories WHERE id IN (${placeholders})`,
      ids,
    )
    return rows.map((row) => this.hydrate(row))
  }

  async findChildren(ownerId: number, parentId: number | null): Promise<FileDirectory[]> {
    const [rows] = await this.db.execute<DirectoryRow[]>(
      'SELECT * FROM file_directories WHERE owner_id = ? AND ((parent_id IS NULL AND ? IS NULL) OR parent_id = ?) ORDER BY name ASC',
      [ownerId, parentId, parentId],
    )
    return rows.map((row) => this.hydrate(row))
  }

  async findRoot(ownerId: number): Promise<FileDirectory[]> {
    return this.findChildren(ownerId, null)
  }

  async findByParent(parentId: number | null): Promise<FileDirectory[]> {
    const [rows] = await this.db.execute<DirectoryRow[]>(
      'SELECT * FROM file_directories WHERE (parent_id IS NULL AND ? IS NULL) OR parent_id = ? ORDER BY name ASC',
      [parentId, parentId],
    )
    return rows.map((row) => this.hydrate(row))
  }

  async create(directory: FileDirectory): Promise<FileDirectory> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO file_directories (owner_id, parent_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [directory.ownerId, directory.parentId, directory.name, directory.createdAt, directory.updatedAt],
    )
    const id = result.insertId as number
    return (await this.findById(id)) ?? directory.clone()
  }

  async update(directory: FileDirectory): Promise<FileDirectory> {
    await this.db.execute(
      'UPDATE file_directories SET parent_id = ?, name = ?, updated_at = ? WHERE id = ?',
      [directory.parentId, directory.name, directory.updatedAt, directory.id],
    )
    return (await this.findById(directory.id)) ?? directory.clone()
  }

  async remove(id: number): Promise<void> {
    await this.db.execute('DELETE FROM file_directories WHERE id = ?', [id])
  }

  private hydrate(row: DirectoryRow): FileDirectory {
    return new FileDirectory(
      row.id,
      row.owner_id,
      row.name,
      row.parent_id,
      new Date(row.created_at),
      new Date(row.updated_at),
    )
  }
}
