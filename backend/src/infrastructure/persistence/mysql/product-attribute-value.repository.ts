import { Injectable } from '@nestjs/common';
import { ProductAttributeValue } from '../../../domain/entities/product-attribute-value.entity';
import { ProductAttributeValueRepository } from '../../../domain/repositories/product-attribute-value.repository';
import { MysqlDatabaseService } from './mysql-database.service';

@Injectable()
export class MysqlProductAttributeValueRepository implements ProductAttributeValueRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<ProductAttributeValue | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_attribute_values WHERE id = ?',
      [id]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0] as any);
  }

  async findByProductId(productId: number): Promise<ProductAttributeValue[]> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_attribute_values WHERE product_id = ? ORDER BY created_at',
      [productId]
    );

    return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row as any)) : [];
  }

  async findByAttributeId(attributeId: number): Promise<ProductAttributeValue[]> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_attribute_values WHERE attribute_id = ? ORDER BY created_at',
      [attributeId]
    );

    return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row as any)) : [];
  }

  async findByProductAndAttribute(productId: number, attributeId: number): Promise<ProductAttributeValue | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM product_attribute_values WHERE product_id = ? AND attribute_id = ?',
      [productId, attributeId]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0] as any);
  }

  async save(productAttributeValue: ProductAttributeValue): Promise<ProductAttributeValue> {
    const [result] = await this.db.execute(
      `INSERT INTO product_attribute_values 
       (product_id, attribute_id, value_text, value_number, value_boolean, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productAttributeValue.productId,
        productAttributeValue.attributeId,
        productAttributeValue.valueText,
        productAttributeValue.valueNumber,
        productAttributeValue.valueBoolean,
        productAttributeValue.createdAt,
        productAttributeValue.updatedAt
      ]
    );

    const insertResult = result as any;
    return new ProductAttributeValue(
      insertResult.insertId,
      productAttributeValue.productId,
      productAttributeValue.attributeId,
      productAttributeValue.valueText,
      productAttributeValue.valueNumber,
      productAttributeValue.valueBoolean,
      productAttributeValue.createdAt,
      productAttributeValue.updatedAt
    );
  }

  async update(id: number, productAttributeValue: ProductAttributeValue): Promise<ProductAttributeValue> {
    await this.db.execute(
      `UPDATE product_attribute_values 
       SET value_text = ?, value_number = ?, value_boolean = ?, updated_at = ?
       WHERE id = ?`,
      [
        productAttributeValue.valueText,
        productAttributeValue.valueNumber,
        productAttributeValue.valueBoolean,
        productAttributeValue.updatedAt,
        id
      ]
    );

    return new ProductAttributeValue(
      id,
      productAttributeValue.productId,
      productAttributeValue.attributeId,
      productAttributeValue.valueText,
      productAttributeValue.valueNumber,
      productAttributeValue.valueBoolean,
      productAttributeValue.createdAt,
      productAttributeValue.updatedAt
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.execute('DELETE FROM product_attribute_values WHERE id = ?', [id]);
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.db.execute('DELETE FROM product_attribute_values WHERE product_id = ?', [productId]);
  }

  async deleteByProductAndAttribute(productId: number, attributeId: number): Promise<void> {
    await this.db.execute(
      'DELETE FROM product_attribute_values WHERE product_id = ? AND attribute_id = ?',
      [productId, attributeId]
    );
  }

  private mapRowToEntity(row: any): ProductAttributeValue {
    return new ProductAttributeValue(
      row.id,
      row.product_id,
      row.attribute_id,
      row.value_text,
      row.value_number,
      row.value_boolean,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}

