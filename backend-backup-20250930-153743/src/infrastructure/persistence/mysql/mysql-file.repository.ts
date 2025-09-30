import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { FileEntity, FileVisibility } from '../../../domain/entities/file.entity'
import { FileRepository } from '../../../domain/repositories/file.repository'
import { MysqlDatabaseService } from './mysql-database.service'

interface FileRow extends RowDataPacket {
  id: number
  directory_id: number | null
  owner_id: number
  original_name: string
  display_name: string
  storage_key: string
  mime_type: string | null
  size_bytes: number | null
  visibility: FileVisibility
  created_at: Date
  updated_at: Date
}

@Injectable()
export class MysqlFileRepository implements FileRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<FileEntity | null> {
    const [rows] = await this.db.execute<FileRow[]>(
      'SELECT * FROM files WHERE id = ? LIMIT 1',
      [id],
    )
    if (!rows.length) return null
    return this.hydrate(rows[0])
  }

  async findByIds(ids: number[]): Promise<FileEntity[]> {
    if (!ids.length) return []
    const placeholders = ids.map(() => '?').join(', ')
    const [rows] = await this.db.execute<FileRow[]>(
      `SELECT * FROM files WHERE id IN (${placeholders})`,
      ids,
    )
    return rows.map((row) => this.hydrate(row))
  }

  async findByDirectory(ownerId: number, directoryId: number | null): Promise<FileEntity[]> {
    const [rows] = await this.db.execute<FileRow[]>(
      'SELECT * FROM files WHERE owner_id = ? AND ((directory_id IS NULL AND ? IS NULL) OR directory_id = ?) ORDER BY display_name ASC',
      [ownerId, directoryId, directoryId],
    )
    return rows.map((row) => this.hydrate(row))
  }

  async findByDirectoryAny(directoryId: number | null): Promise<FileEntity[]> {
    const [rows] = await this.db.execute<FileRow[]>(
      'SELECT * FROM files WHERE (directory_id IS NULL AND ? IS NULL) OR directory_id = ? ORDER BY display_name ASC',
      [directoryId, directoryId],
    )
    return rows.map((row) => this.hydrate(row))
  }

  async create(file: FileEntity): Promise<FileEntity> {
    const [result] = await this.db.execute<ResultSetHeader>(
      `INSERT INTO files (directory_id, owner_id, original_name, display_name, storage_key, mime_type, size_bytes, visibility, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file.directoryId,
        file.ownerId,
        file.originalName,
        file.displayName,
        file.storageKey,
        file.mimeType,
        file.sizeBytes,
        file.visibility,
        file.createdAt,
        file.updatedAt,
      ],
    )
    const id = result.insertId as number
    return (await this.findById(id)) ?? file.clone()
  }

  async update(file: FileEntity): Promise<FileEntity> {
    await this.db.execute(
      `UPDATE files SET directory_id = ?, display_name = ?, storage_key = ?, mime_type = ?, size_bytes = ?, visibility = ?, updated_at = ?
       WHERE id = ?`,
      [
        file.directoryId,
        file.displayName,
        file.storageKey,
        file.mimeType,
        file.sizeBytes,
        file.visibility,
        file.updatedAt,
        file.id,
      ],
    )
    return (await this.findById(file.id)) ?? file.clone()
  }

  async remove(id: number): Promise<void> {
    await this.db.execute('DELETE FROM files WHERE id = ?', [id])
  }

  private hydrate(row: FileRow): FileEntity {
    return new FileEntity(
      row.id,
      row.owner_id,
      row.directory_id,
      row.original_name,
      row.display_name,
      row.storage_key,
      row.mime_type,
      row.size_bytes,
      row.visibility,
      new Date(row.created_at),
      new Date(row.updated_at),
    )
  }
}
