import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import {
  ProductAttributeDefinition,
  ProductAttributeInputType,
  ProductAttributeTerm,
} from '../../../domain/entities/product-attribute.entity'
import {
  PRODUCT_ATTRIBUTE_REPOSITORY,
  ProductAttributeRepository,
} from '../../../domain/repositories/product-attribute.repository'
import { MysqlDatabaseService } from './mysql-database.service'

interface AttributeRow extends RowDataPacket {
  id: number
  name: string
  slug: string
  description: string | null
  input_type: string
  created_at: Date
  updated_at: Date
}

interface AttributeTermRow extends RowDataPacket {
  id: number
  attribute_id: number
  name: string
  slug: string
  sort_order: number
  metadata: string | null
  created_at: Date
  updated_at: Date
}

@Injectable()
export class MysqlProductAttributeRepository implements ProductAttributeRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(): Promise<ProductAttributeDefinition[]> {
    const [attributeRows] = await this.db.execute<AttributeRow[]>(
      'SELECT * FROM product_attributes ORDER BY name ASC',
    )
    const definitions = await Promise.all(attributeRows.map((row) => this.hydrateDefinition(row)))
    return definitions
  }

  async findById(id: number): Promise<ProductAttributeDefinition | null> {
    const [rows] = await this.db.execute<AttributeRow[]>(
      'SELECT * FROM product_attributes WHERE id = ? LIMIT 1',
      [id],
    )
    if (!rows.length) return null
    return this.hydrateDefinition(rows[0])
  }

  async findBySlug(slug: string): Promise<ProductAttributeDefinition | null> {
    const [rows] = await this.db.execute<AttributeRow[]>(
      'SELECT * FROM product_attributes WHERE slug = ? LIMIT 1',
      [slug],
    )
    if (!rows.length) return null
    return this.hydrateDefinition(rows[0])
  }

  async create(definition: ProductAttributeDefinition): Promise<ProductAttributeDefinition> {
    const now = definition.updatedAt ?? new Date()
    const [result] = await this.db.execute<ResultSetHeader>(
      `INSERT INTO product_attributes (name, slug, description, input_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        definition.name,
        definition.slug,
        definition.description,
        definition.inputType,
        definition.createdAt,
        now,
      ],
    )
    const id = result.insertId as number
    const created = await this.findById(id)
    return created ?? definition.clone()
  }

  async update(definition: ProductAttributeDefinition): Promise<ProductAttributeDefinition> {
    await this.db.execute(
      `UPDATE product_attributes
       SET name = ?, slug = ?, description = ?, input_type = ?, updated_at = ?
       WHERE id = ?`,
      [
        definition.name,
        definition.slug,
        definition.description,
        definition.inputType,
        definition.updatedAt,
        definition.id,
      ],
    )
    const updated = await this.findById(definition.id)
    return updated ?? definition.clone()
  }

  async remove(id: number): Promise<ProductAttributeDefinition | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    await this.db.execute('DELETE FROM product_attributes WHERE id = ?', [id])
    return existing
  }

  async addTerm(attributeId: number, term: ProductAttributeTerm): Promise<ProductAttributeTerm> {
    const [result] = await this.db.execute<ResultSetHeader>(
      `INSERT INTO product_attribute_terms (attribute_id, name, slug, sort_order, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        attributeId,
        term.name,
        term.slug,
        term.order,
        term.metadata ? JSON.stringify(term.metadata) : null,
        term.createdAt,
        term.updatedAt,
      ],
    )
    const id = result.insertId as number
    const created = await this.findTermById(attributeId, id)
    return created ?? term.clone()
  }

  async updateTerm(attributeId: number, term: ProductAttributeTerm): Promise<ProductAttributeTerm> {
    await this.db.execute(
      `UPDATE product_attribute_terms
       SET name = ?, slug = ?, sort_order = ?, metadata = ?, updated_at = ?
       WHERE id = ? AND attribute_id = ?`,
      [
        term.name,
        term.slug,
        term.order,
        term.metadata ? JSON.stringify(term.metadata) : null,
        term.updatedAt,
        term.id,
        attributeId,
      ],
    )
    const updated = await this.findTermById(attributeId, term.id)
    return updated ?? term.clone()
  }

  async removeTerm(attributeId: number, termId: number): Promise<ProductAttributeTerm | null> {
    const existing = await this.findTermById(attributeId, termId)
    if (!existing) return null
    await this.db.execute(
      'DELETE FROM product_attribute_terms WHERE id = ? AND attribute_id = ?',
      [termId, attributeId],
    )
    return existing
  }

  async nextAttributeId(): Promise<number> {
    const database = this.db.getDatabaseName()
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT AUTO_INCREMENT FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'product_attributes'`,
      [database],
    )
    const nextId = rows[0]?.AUTO_INCREMENT
    return nextId ? Number(nextId) : 1
  }

  async nextTermId(attributeId: number): Promise<number> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      'SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_NAME = "product_attribute_terms" AND TABLE_SCHEMA = ?',
      [this.db.getDatabaseName()],
    )
    const nextId = rows[0]?.AUTO_INCREMENT
    return nextId ? Number(nextId) : 1
  }

  private async hydrateDefinition(row: AttributeRow): Promise<ProductAttributeDefinition> {
    const terms = await this.loadTerms(row.id)
    return new ProductAttributeDefinition({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      inputType: row.input_type as ProductAttributeInputType,
      terms,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    })
  }

  private async loadTerms(attributeId: number): Promise<ProductAttributeTerm[]> {
    const [rows] = await this.db.execute<AttributeTermRow[]>(
      'SELECT * FROM product_attribute_terms WHERE attribute_id = ? ORDER BY sort_order ASC, name ASC',
      [attributeId],
    )
    return rows.map((row) => new ProductAttributeTerm({
      id: row.id,
      attributeId: row.attribute_id,
      name: row.name,
      slug: row.slug,
      order: row.sort_order,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  }

  private async findTermById(attributeId: number, termId: number): Promise<ProductAttributeTerm | null> {
    const [rows] = await this.db.execute<AttributeTermRow[]>(
      'SELECT * FROM product_attribute_terms WHERE attribute_id = ? AND id = ? LIMIT 1',
      [attributeId, termId],
    )
    if (!rows.length) return null
    const row = rows[0]
    return new ProductAttributeTerm({
      id: row.id,
      attributeId: row.attribute_id,
      name: row.name,
      slug: row.slug,
      order: row.sort_order,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    })
  }
}
