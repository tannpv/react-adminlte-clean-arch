import { Injectable } from '@nestjs/common';
import { ProductVariant } from '../../../domain/entities/product-variant.entity';
import { ProductVariantRepository } from '../../../domain/repositories/product-variant.repository';
import { MysqlDatabaseService } from './mysql-database.service';

@Injectable()
export class MysqlProductVariantRepository implements ProductVariantRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<ProductVariant | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_variants WHERE id = ?',
      [id]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0] as any);
  }

  async findByProductId(productId: number): Promise<ProductVariant[]> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY created_at',
      [productId]
    );

    return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row as any)) : [];
  }

  async findBySku(sku: string): Promise<ProductVariant | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_variants WHERE sku = ?',
      [sku]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0] as any);
  }

  async save(productVariant: ProductVariant): Promise<ProductVariant> {
    const [result] = await this.db.execute(
      `INSERT INTO product_variants 
       (product_id, sku, name, price_cents, currency, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productVariant.productId,
        productVariant.sku,
        productVariant.name,
        productVariant.priceCents,
        productVariant.currency,
        productVariant.status,
        productVariant.createdAt,
        productVariant.updatedAt
      ]
    );

    const insertResult = result as any;
    return new ProductVariant(
      insertResult.insertId,
      productVariant.productId,
      productVariant.sku,
      productVariant.name,
      productVariant.priceCents,
      productVariant.currency,
      productVariant.status,
      productVariant.createdAt,
      productVariant.updatedAt
    );
  }

  async update(id: number, productVariant: ProductVariant): Promise<ProductVariant> {
    await this.db.execute(
      `UPDATE product_variants 
       SET sku = ?, name = ?, price_cents = ?, currency = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [
        productVariant.sku,
        productVariant.name,
        productVariant.priceCents,
        productVariant.currency,
        productVariant.status,
        productVariant.updatedAt,
        id
      ]
    );

    return new ProductVariant(
      id,
      productVariant.productId,
      productVariant.sku,
      productVariant.name,
      productVariant.priceCents,
      productVariant.currency,
      productVariant.status,
      productVariant.createdAt,
      productVariant.updatedAt
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.execute('DELETE FROM product_variants WHERE id = ?', [id]);
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.db.execute('DELETE FROM product_variants WHERE product_id = ?', [productId]);
  }

  private mapRowToEntity(row: any): ProductVariant {
    return new ProductVariant(
      row.id,
      row.product_id,
      row.sku,
      row.name,
      row.price_cents,
      row.currency,
      row.status,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}

