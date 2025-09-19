import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { Category } from '../../../domain/entities/category.entity'
import { CategoryRepository } from '../../../domain/repositories/category.repository'
import { MysqlDatabaseService } from './mysql-database.service'

interface CategoryRow extends RowDataPacket {
  id: number
  name: string
}

interface AutoIncrementRow extends RowDataPacket {
  AUTO_INCREMENT: number
}

@Injectable()
export class MysqlCategoryRepository implements CategoryRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(): Promise<Category[]> {
    const [rows] = await this.db.execute<CategoryRow[]>(
      'SELECT id, name FROM categories ORDER BY name ASC',
    )
    return rows.map((row) => new Category(row.id, row.name))
  }

  async findById(id: number): Promise<Category | null> {
    const [rows] = await this.db.execute<CategoryRow[]>(
      'SELECT id, name FROM categories WHERE id = ? LIMIT 1',
      [id],
    )
    if (!rows.length) return null
    return new Category(rows[0].id, rows[0].name)
  }

  async findByIds(ids: number[]): Promise<Category[]> {
    if (!ids.length) return []
    const placeholders = ids.map(() => '?').join(', ')
    const [rows] = await this.db.execute<CategoryRow[]>(
      `SELECT id, name FROM categories WHERE id IN (${placeholders})`,
      ids,
    )
    return rows.map((row) => new Category(row.id, row.name))
  }

  async findByName(name: string): Promise<Category | null> {
    const [rows] = await this.db.execute<CategoryRow[]>(
      'SELECT id, name FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1',
      [name],
    )
    if (!rows.length) return null
    const row = rows[0]
    return new Category(row.id, row.name)
  }

  async create(category: Category): Promise<Category> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO categories (name) VALUES (?)',
      [category.name],
    )
    const id = result.insertId as number
    return new Category(id, category.name)
  }

  async update(category: Category): Promise<Category> {
    await this.db.execute('UPDATE categories SET name = ? WHERE id = ?', [category.name, category.id])
    return category.clone()
  }

  async remove(id: number): Promise<Category | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    await this.db.execute('DELETE FROM categories WHERE id = ?', [id])
    return existing
  }

  async nextId(): Promise<number> {
    const database = this.db.getDatabaseName()
    const [rows] = await this.db.execute<AutoIncrementRow[]>(
      `SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories'`,
      [database],
    )
    const nextId = rows[0]?.AUTO_INCREMENT
    return nextId ? Number(nextId) : 1
  }
}

