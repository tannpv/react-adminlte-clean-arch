import { Injectable } from '@nestjs/common';
import { ProductVariantAttributeValue } from '../../../domain/entities/product-variant-attribute-value.entity';
import { ProductVariantAttributeValueRepository } from '../../../domain/repositories/product-variant-attribute-value.repository';
import { MysqlDatabaseService } from './mysql-database.service';

@Injectable()
export class MysqlProductVariantAttributeValueRepository implements ProductVariantAttributeValueRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<ProductVariantAttributeValue | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_variant_attribute_values WHERE id = ?',
      [id]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0] as any);
  }

  async findByVariantId(variantId: number): Promise<ProductVariantAttributeValue[]> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_variant_attribute_values WHERE variant_id = ? ORDER BY created_at',
      [variantId]
    );

    return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row as any)) : [];
  }

  async findByAttributeId(attributeId: number): Promise<ProductVariantAttributeValue[]> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_variant_attribute_values WHERE attribute_id = ? ORDER BY created_at',
      [attributeId]
    );

    return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row as any)) : [];
  }

  async findByVariantAndAttribute(variantId: number, attributeId: number): Promise<ProductVariantAttributeValue | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_variant_attribute_values WHERE variant_id = ? AND attribute_id = ?',
      [variantId, attributeId]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0] as any);
  }

  async save(productVariantAttributeValue: ProductVariantAttributeValue): Promise<ProductVariantAttributeValue> {
    const [result] = await this.db.execute(
      `INSERT INTO product_variant_attribute_values 
       (variant_id, attribute_id, value_text, value_number, value_boolean, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productVariantAttributeValue.variantId,
        productVariantAttributeValue.attributeId,
        productVariantAttributeValue.valueText,
        productVariantAttributeValue.valueNumber,
        productVariantAttributeValue.valueBoolean,
        productVariantAttributeValue.createdAt,
        productVariantAttributeValue.updatedAt
      ]
    );

    const insertResult = result as any;
    return new ProductVariantAttributeValue(
      insertResult.insertId,
      productVariantAttributeValue.variantId,
      productVariantAttributeValue.attributeId,
      productVariantAttributeValue.valueText,
      productVariantAttributeValue.valueNumber,
      productVariantAttributeValue.valueBoolean,
      productVariantAttributeValue.createdAt,
      productVariantAttributeValue.updatedAt
    );
  }

  async update(id: number, productVariantAttributeValue: ProductVariantAttributeValue): Promise<ProductVariantAttributeValue> {
    await this.db.execute(
      `UPDATE product_variant_attribute_values 
       SET value_text = ?, value_number = ?, value_boolean = ?, updated_at = ?
       WHERE id = ?`,
      [
        productVariantAttributeValue.valueText,
        productVariantAttributeValue.valueNumber,
        productVariantAttributeValue.valueBoolean,
        productVariantAttributeValue.updatedAt,
        id
      ]
    );

    return new ProductVariantAttributeValue(
      id,
      productVariantAttributeValue.variantId,
      productVariantAttributeValue.attributeId,
      productVariantAttributeValue.valueText,
      productVariantAttributeValue.valueNumber,
      productVariantAttributeValue.valueBoolean,
      productVariantAttributeValue.createdAt,
      productVariantAttributeValue.updatedAt
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.execute('DELETE FROM product_variant_attribute_values WHERE id = ?', [id]);
  }

  async deleteByVariantId(variantId: number): Promise<void> {
    await this.db.execute('DELETE FROM product_variant_attribute_values WHERE variant_id = ?', [variantId]);
  }

  async deleteByVariantAndAttribute(variantId: number, attributeId: number): Promise<void> {
    await this.db.execute(
      'DELETE FROM product_variant_attribute_values WHERE variant_id = ? AND attribute_id = ?',
      [variantId, attributeId]
    );
  }

  private mapRowToEntity(row: any): ProductVariantAttributeValue {
    return new ProductVariantAttributeValue(
      row.id,
      row.variant_id,
      row.attribute_id,
      row.value_text,
      row.value_number,
      row.value_boolean,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}

