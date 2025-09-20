import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import {
  Product,
  ProductStatus,
  ProductType,
  ProductAttributeSelection,
  ProductVariant,
  ProductVariantAttributeValue,
} from '../../../domain/entities/product.entity'
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
  type: string
  metadata: string | null
  created_at: Date
  updated_at: Date
}

interface ProductCategoryRow extends RowDataPacket {
  category_id: number
  name: string
  parent_id: number | null
}

interface AttributeAssignmentRow extends RowDataPacket {
  attribute_id: number
  is_visible: number
  is_variation: number
  sort_order: number
  attribute_name: string
  attribute_slug: string
}

interface AttributeAssignmentTermRow extends RowDataPacket {
  attribute_id: number
  term_id: number
  term_name: string
  term_slug: string
  sort_order: number
}

interface VariantRow extends RowDataPacket {
  id: number
  product_id: number
  sku: string
  price_cents: number
  sale_price_cents: number | null
  currency: string
  status: string
  stock_quantity: number | null
  metadata: string | null
  created_at: Date
  updated_at: Date
}

interface VariantAttributeValueRow extends RowDataPacket {
  variant_id: number
  attribute_id: number
  attribute_name: string
  attribute_slug: string
  term_id: number
  term_name: string
  term_slug: string
  sort_order: number
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
      `INSERT INTO products (sku, name, description, price_cents, currency, status, type, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.sku,
        product.name,
        product.description,
        product.priceCents,
        product.currency,
        product.status,
        product.type,
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
       SET sku = ?, name = ?, description = ?, price_cents = ?, currency = ?, status = ?, type = ?, metadata = ?, updated_at = ?
       WHERE id = ?`,
      [
        product.sku,
        product.name,
        product.description,
        product.priceCents,
        product.currency,
        product.status,
        product.type,
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
    const attributes = await this.loadAttributes(row.id)
    const variants = await this.loadVariants(row.id)

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
      type: (row.type as ProductType) ?? 'simple',
      attributes,
      variants,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    })
  }

  private async loadCategories(productId: number): Promise<Category[]> {
    const [rows] = await this.db.execute<ProductCategoryRow[]>(
      `SELECT pc.category_id, c.name, c.parent_id
       FROM product_categories pc
       INNER JOIN categories c ON c.id = pc.category_id
       WHERE pc.product_id = ?
       ORDER BY c.name ASC`,
      [productId],
    )
    return rows.map((row) => new Category(row.category_id, row.name, row.parent_id ?? null))
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

  private async loadAttributes(productId: number): Promise<ProductAttributeSelection[]> {
    const [assignmentRows] = await this.db.execute<AttributeAssignmentRow[]>(
      `SELECT paa.attribute_id,
              paa.is_visible,
              paa.is_variation,
              paa.sort_order,
              pa.name AS attribute_name,
              pa.slug AS attribute_slug
         FROM product_attribute_assignments paa
         INNER JOIN product_attributes pa ON pa.id = paa.attribute_id
        WHERE paa.product_id = ?
        ORDER BY paa.sort_order ASC, pa.name ASC`,
      [productId],
    )

    if (!assignmentRows.length) return []

    const [termRows] = await this.db.execute<AttributeAssignmentTermRow[]>(
      `SELECT pat.attribute_id,
              pat.term_id,
              pat.sort_order,
              tat.name AS term_name,
              tat.slug AS term_slug
         FROM product_attribute_assignment_terms pat
         INNER JOIN product_attribute_terms tat ON tat.id = pat.term_id
        WHERE pat.product_id = ?
        ORDER BY pat.attribute_id ASC, pat.sort_order ASC, tat.name ASC`,
      [productId],
    )

    const groupedTerms = new Map<number, AttributeAssignmentTermRow[]>()
    termRows.forEach((row) => {
      if (!groupedTerms.has(row.attribute_id)) {
        groupedTerms.set(row.attribute_id, [])
      }
      groupedTerms.get(row.attribute_id)!.push(row)
    })

    return assignmentRows.map<ProductAttributeSelection>((row) => ({
      attributeId: row.attribute_id,
      attributeName: row.attribute_name,
      attributeSlug: row.attribute_slug,
      visible: Boolean(row.is_visible),
      variation: Boolean(row.is_variation),
      terms: (groupedTerms.get(row.attribute_id) ?? []).map((termRow) => ({
        termId: termRow.term_id,
        termName: termRow.term_name,
        termSlug: termRow.term_slug,
      })),
    }))
  }

  private async loadVariants(productId: number): Promise<ProductVariant[]> {
    const [variantRows] = await this.db.execute<VariantRow[]>(
      `SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC`,
      [productId],
    )

    if (!variantRows.length) return []

    const variantIds = variantRows.map((row) => row.id)
    const [valueRows] = await this.db.execute<VariantAttributeValueRow[]>(
      `SELECT vav.variant_id,
              vav.attribute_id,
              pa.name AS attribute_name,
              pa.slug AS attribute_slug,
              vav.term_id,
              tat.name AS term_name,
              tat.slug AS term_slug,
              tat.sort_order
         FROM product_variant_attribute_values vav
         INNER JOIN product_attributes pa ON pa.id = vav.attribute_id
         INNER JOIN product_attribute_terms tat ON tat.id = vav.term_id
        WHERE vav.variant_id IN (${variantIds.map(() => '?').join(',')})
        ORDER BY vav.variant_id ASC, tat.sort_order ASC, tat.name ASC`,
      variantIds,
    )

    const groupedValues = new Map<number, ProductVariantAttributeValue[]>()
    valueRows.forEach((row) => {
      if (!groupedValues.has(row.variant_id)) {
        groupedValues.set(row.variant_id, [])
      }
      groupedValues.get(row.variant_id)!.push({
        attributeId: row.attribute_id,
        attributeName: row.attribute_name,
        attributeSlug: row.attribute_slug,
        termId: row.term_id,
        termName: row.term_name,
        termSlug: row.term_slug,
      })
    })

    return variantRows.map((row) => {
      let metadata: Record<string, unknown> | null = null
      if (row.metadata) {
        try {
          metadata = JSON.parse(row.metadata)
        } catch {
          metadata = null
        }
      }

      return new ProductVariant({
        id: row.id,
        sku: row.sku,
        priceCents: row.price_cents,
        salePriceCents: row.sale_price_cents ?? null,
        currency: row.currency,
        status: row.status as ProductStatus,
        stockQuantity: row.stock_quantity ?? null,
        metadata,
        attributes: groupedValues.get(row.id) ?? [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      })
    })
  }

  private async replaceAttributes(productId: number, attributes: ProductAttributeSelection[]): Promise<void> {
    await this.db.execute(
      'DELETE FROM product_attribute_assignment_terms WHERE product_id = ?',
      [productId],
    )
    await this.db.execute('DELETE FROM product_attribute_assignments WHERE product_id = ?', [productId])
    if (!attributes.length) return

    for (let index = 0; index < attributes.length; index += 1) {
      const attribute = attributes[index]
      await this.db.execute(
        `INSERT INTO product_attribute_assignments
         (product_id, attribute_id, is_visible, is_variation, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [
          productId,
          attribute.attributeId,
          attribute.visible ? 1 : 0,
          attribute.variation ? 1 : 0,
          index,
        ],
      )

      if (attribute.terms && attribute.terms.length) {
        const placeholders = attribute.terms.map(() => '(?, ?, ?)').join(', ')
        const params = attribute.terms.flatMap((term, order) => [
          productId,
          attribute.attributeId,
          term.termId,
        ])
        await this.db.execute(
          `INSERT INTO product_attribute_assignment_terms (product_id, attribute_id, term_id)
           VALUES ${placeholders}`,
          params,
        )
      }
    }
  }

  private async replaceVariants(productId: number, variants: ProductVariant[]): Promise<void> {
    await this.db.execute(
      `DELETE vav FROM product_variant_attribute_values vav
        INNER JOIN product_variants pv ON pv.id = vav.variant_id
        WHERE pv.product_id = ?`,
      [productId],
    )
    await this.db.execute('DELETE FROM product_variants WHERE product_id = ?', [productId])
    if (!variants.length) return

    for (const variant of variants) {
      const [result] = await this.db.execute<ResultSetHeader>(
        `INSERT INTO product_variants
         (product_id, sku, price_cents, sale_price_cents, currency, status, stock_quantity, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          variant.sku,
          variant.priceCents,
          variant.salePriceCents ?? null,
          variant.currency,
          variant.status,
          variant.stockQuantity ?? null,
          variant.metadata ? JSON.stringify(variant.metadata) : null,
          variant.createdAt,
          variant.updatedAt,
        ],
      )
      const variantId = result.insertId as number

      if (variant.attributes && variant.attributes.length) {
        const placeholders = variant.attributes.map(() => '(?, ?, ?)').join(', ')
        const params = variant.attributes.flatMap((value) => [
          variantId,
          value.attributeId,
          value.termId,
        ])
        await this.db.execute(
          `INSERT INTO product_variant_attribute_values (variant_id, attribute_id, term_id)
           VALUES ${placeholders}`,
          params,
        )
      }
    }
  }
}
