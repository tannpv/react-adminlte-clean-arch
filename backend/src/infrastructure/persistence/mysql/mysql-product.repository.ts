import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { Product, ProductStatus } from '../../../domain/entities/product.entity'
import { ProductRepository } from '../../../domain/repositories/product.repository'
import { MysqlDatabaseService } from './mysql-database.service'

interface ProductRow extends RowDataPacket {
  id: number
  sku: string
  name: string
  description: string | null
  price_cents: number
  currency: string
  status: string
  metadata: string | null
  created_at: Date
  updated_at: Date
}

@Injectable()
export class MysqlProductRepository implements ProductRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(): Promise<Product[]> {
    const [rows] = await this.db.execute<ProductRow[]>(
      'SELECT * FROM products ORDER BY updated_at DESC',
    )
    return rows.map((row) => this.hydrate(row))
  }

  async findById(id: number): Promise<Product | null> {
    const [rows] = await this.db.execute<ProductRow[]>(
      'SELECT * FROM products WHERE id = ? LIMIT 1',
      [id],
    )
    if (!rows.length) return null
    return this.hydrate(rows[0])
  }

  async findBySku(sku: string): Promise<Product | null> {
    const [rows] = await this.db.execute<ProductRow[]>(
      'SELECT * FROM products WHERE sku = ? LIMIT 1',
      [sku],
    )
    if (!rows.length) return null
    return this.hydrate(rows[0])
  }

  async create(product: Product): Promise<Product> {
    const now = product.updatedAt ?? new Date()
    const [result] = await this.db.execute<ResultSetHeader>(
      `INSERT INTO products (sku, name, description, price_cents, currency, status, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.sku,
        product.name,
        product.description,
        product.priceCents,
        product.currency,
        product.status,
        product.metadata ? JSON.stringify(product.metadata) : null,
        product.createdAt,
        now,
      ],
    )
    const id = result.insertId as number
    const created = await this.findById(id)
    // findById should not return null immediately after insert, but fallback for safety
    return created ?? product.clone()
  }

  async update(product: Product): Promise<Product> {
    const now = new Date()
    await this.db.execute(
      `UPDATE products
       SET sku = ?, name = ?, description = ?, price_cents = ?, currency = ?, status = ?, metadata = ?, updated_at = ?
       WHERE id = ?`,
      [
        product.sku,
        product.name,
        product.description,
        product.priceCents,
        product.currency,
        product.status,
        product.metadata ? JSON.stringify(product.metadata) : null,
        now,
        product.id,
      ],
    )
    const updated = await this.findById(product.id)
    return updated ?? product
  }

  async remove(id: number): Promise<Product | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    await this.db.execute('DELETE FROM products WHERE id = ?', [id])
    return existing
  }

  async nextId(): Promise<number> {
    const database = this.db.getDatabaseName()
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'`,
      [database],
    )
    const nextId = rows[0]?.AUTO_INCREMENT
    return nextId ? Number(nextId) : 1
  }

  private hydrate(row: ProductRow): Product {
    let metadata: Record<string, unknown> | null = null
    if (row.metadata) {
      try {
        metadata = JSON.parse(row.metadata)
      } catch {
        metadata = null
      }
    }

    return new Product({
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      priceCents: row.price_cents,
      currency: row.currency,
      status: row.status as ProductStatus,
      metadata,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    })
  }
}
