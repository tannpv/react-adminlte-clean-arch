import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { Product, ProductStatus } from '../../../domain/entities/product.entity'
import { Category } from '../../../domain/entities/category.entity'
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

interface ProductCategoryRow extends RowDataPacket {
  category_id: number
  name: string
}

@Injectable()
export class MysqlProductRepository implements ProductRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(): Promise<Product[]> {
    const [rows] = await this.db.execute<ProductRow[]>(
      'SELECT * FROM products ORDER BY updated_at DESC',
    )
    return Promise.all(rows.map((row) => this.hydrate(row)))
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
    await this.replaceCategories(id, product.categoryIds)
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
    await this.replaceCategories(product.id, product.categoryIds)
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

  private async hydrate(row: ProductRow): Promise<Product> {
    let metadata: Record<string, unknown> | null = null
    if (row.metadata) {
      try {
        metadata = JSON.parse(row.metadata)
      } catch {
        metadata = null
      }
    }

    const categories = await this.loadCategories(row.id)

    return new Product({
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      priceCents: row.price_cents,
      currency: row.currency,
      status: row.status as ProductStatus,
      metadata,
      categories,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    })
  }

  private async loadCategories(productId: number): Promise<Category[]> {
    const [rows] = await this.db.execute<ProductCategoryRow[]>(
      `SELECT pc.category_id, c.name
       FROM product_categories pc
       INNER JOIN categories c ON c.id = pc.category_id
       WHERE pc.product_id = ?
       ORDER BY c.name ASC`,
      [productId],
    )
    return rows.map((row) => new Category(row.category_id, row.name))
  }

  private async replaceCategories(productId: number, categoryIds: number[]): Promise<void> {
    await this.db.execute('DELETE FROM product_categories WHERE product_id = ?', [productId])
    if (!categoryIds || !categoryIds.length) return
    const uniqueIds = Array.from(new Set(categoryIds))
    const placeholders = uniqueIds.map(() => '(?, ?)').join(', ')
    const params = uniqueIds.flatMap((categoryId) => [productId, categoryId])
    await this.db.execute(
      `INSERT IGNORE INTO product_categories (product_id, category_id) VALUES ${placeholders}`,
      params,
    )
  }
}
