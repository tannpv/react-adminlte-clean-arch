import { Injectable } from "@nestjs/common";
import { ProductAttributeValue } from "../../../domain/entities/product-attribute-value.entity";
import { ProductAttributeValueRepository } from "../../../domain/repositories/product-attribute-value.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlProductAttributeValueRepository
  implements ProductAttributeValueRepository
{
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<ProductAttributeValue | null> {
    const [rows] = await this.db.execute(
      "SELECT * FROM product_attribute_values WHERE id = ?",
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0] as any);
  }

  async findByProductId(productId: number): Promise<ProductAttributeValue[]> {
    const [rows] = await this.db.execute(
      "SELECT * FROM product_attribute_values WHERE product_id = ? ORDER BY created_at",
      [productId]
    );

    return Array.isArray(rows)
      ? rows.map((row) => this.mapRowToEntity(row as any))
      : [];
  }

  async findByAttributeId(
    attributeId: number
  ): Promise<ProductAttributeValue[]> {
    const [rows] = await this.db.execute(
      "SELECT * FROM product_attribute_values WHERE attribute_id = ? ORDER BY created_at",
      [attributeId]
    );

    return Array.isArray(rows)
      ? rows.map((row) => this.mapRowToEntity(row as any))
      : [];
  }

  async findByProductAndAttribute(
    productId: number,
    attributeId: number
  ): Promise<ProductAttributeValue | null> {
    const [rows] = await this.db.execute(
      "SELECT * FROM product_attribute_values WHERE product_id = ? AND attribute_id = ?",
      [productId, attributeId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0] as any);
  }

  async save(
    productAttributeValue: ProductAttributeValue
  ): Promise<ProductAttributeValue> {
    const [result] = await this.db.execute(
      `INSERT INTO product_attribute_values 
       (product_id, attribute_id, attribute_value_id, value_text, value_number, value_boolean, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productAttributeValue.productId,
        productAttributeValue.attributeId,
        productAttributeValue.attributeValueId,
        productAttributeValue.valueText,
        productAttributeValue.valueNumber,
        productAttributeValue.valueBoolean,
        productAttributeValue.createdAt,
        productAttributeValue.updatedAt,
      ]
    );

    const insertResult = result as any;
    return new ProductAttributeValue(
      insertResult.insertId,
      productAttributeValue.productId,
      productAttributeValue.attributeId,
      productAttributeValue.attributeValueId,
      productAttributeValue.valueText,
      productAttributeValue.valueNumber,
      productAttributeValue.valueBoolean,
      productAttributeValue.createdAt,
      productAttributeValue.updatedAt
    );
  }

  async update(
    id: number,
    productAttributeValue: ProductAttributeValue
  ): Promise<ProductAttributeValue> {
    await this.db.execute(
      `UPDATE product_attribute_values 
       SET attribute_value_id = ?, value_text = ?, value_number = ?, value_boolean = ?, updated_at = ?
       WHERE id = ?`,
      [
        productAttributeValue.attributeValueId,
        productAttributeValue.valueText,
        productAttributeValue.valueNumber,
        productAttributeValue.valueBoolean,
        productAttributeValue.updatedAt,
        id,
      ]
    );

    return new ProductAttributeValue(
      id,
      productAttributeValue.productId,
      productAttributeValue.attributeId,
      productAttributeValue.attributeValueId,
      productAttributeValue.valueText,
      productAttributeValue.valueNumber,
      productAttributeValue.valueBoolean,
      productAttributeValue.createdAt,
      productAttributeValue.updatedAt
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.execute("DELETE FROM product_attribute_values WHERE id = ?", [
      id,
    ]);
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.db.execute(
      "DELETE FROM product_attribute_values WHERE product_id = ?",
      [productId]
    );
  }

  async deleteByProductAndAttribute(
    productId: number,
    attributeId: number
  ): Promise<void> {
    await this.db.execute(
      "DELETE FROM product_attribute_values WHERE product_id = ? AND attribute_id = ?",
      [productId, attributeId]
    );
  }

  // Advanced filtering methods for normalized schema

  async findProductsByAttributeValues(
    attributeValueIds: number[]
  ): Promise<number[]> {
    if (attributeValueIds.length === 0) return [];

    const placeholders = attributeValueIds.map(() => "?").join(",");
    const [rows] = await this.db.execute(
      `SELECT DISTINCT product_id 
       FROM product_attribute_values 
       WHERE attribute_value_id IN (${placeholders})`,
      attributeValueIds
    );

    return (rows as any[]).map((row) => row.product_id);
  }

  async getFacetedSearchData(attributeId: number): Promise<
    Array<{
      attributeValueId: number;
      label: string;
      productCount: number;
    }>
  > {
    const [rows] = await this.db.execute(
      `SELECT 
         av.id as attributeValueId,
         av.label,
         COUNT(DISTINCT pav.product_id) as productCount
       FROM attribute_values av
       LEFT JOIN product_attribute_values pav ON av.id = pav.attribute_value_id 
         AND pav.attribute_id = ?
       WHERE av.attribute_id = ?
       GROUP BY av.id, av.label
       HAVING productCount > 0
       ORDER BY productCount DESC, av.label ASC`,
      [attributeId, attributeId]
    );

    return (rows as any[]).map((row) => ({
      attributeValueId: row.attributeValueId,
      label: row.label,
      productCount: parseInt(row.productCount),
    }));
  }

  async getMultiAttributeFacetedSearchData(attributeIds: number[]): Promise<
    Record<
      number,
      Array<{
        attributeValueId: number;
        label: string;
        productCount: number;
      }>
    >
  > {
    if (attributeIds.length === 0) return {};

    const placeholders = attributeIds.map(() => "?").join(",");
    const [rows] = await this.db.execute(
      `SELECT 
         av.attribute_id,
         av.id as attributeValueId,
         av.label,
         COUNT(DISTINCT pav.product_id) as productCount
       FROM attribute_values av
       LEFT JOIN product_attribute_values pav ON av.id = pav.attribute_value_id 
         AND pav.attribute_id = av.attribute_id
       WHERE av.attribute_id IN (${placeholders})
       GROUP BY av.attribute_id, av.id, av.label
       HAVING productCount > 0
       ORDER BY av.attribute_id, productCount DESC, av.label ASC`,
      attributeIds
    );

    const result: Record<
      number,
      Array<{
        attributeValueId: number;
        label: string;
        productCount: number;
      }>
    > = {};

    (rows as any[]).forEach((row) => {
      const attributeId = row.attribute_id;
      if (!result[attributeId]) {
        result[attributeId] = [];
      }
      result[attributeId].push({
        attributeValueId: row.attributeValueId,
        label: row.label,
        productCount: parseInt(row.productCount),
      });
    });

    return result;
  }

  async filterProductsByAttributes(
    attributeFilters: Array<{
      attributeId: number;
      attributeValueIds: number[];
    }>
  ): Promise<number[]> {
    if (attributeFilters.length === 0) return [];

    // Build dynamic query for multiple attribute filters
    const conditions: string[] = [];
    const params: any[] = [];

    attributeFilters.forEach((filter, index) => {
      if (filter.attributeValueIds.length > 0) {
        const placeholders = filter.attributeValueIds.map(() => "?").join(",");
        conditions.push(`(
          SELECT product_id 
          FROM product_attribute_values 
          WHERE attribute_id = ? AND attribute_value_id IN (${placeholders})
        )`);
        params.push(filter.attributeId, ...filter.attributeValueIds);
      }
    });

    if (conditions.length === 0) return [];

    // Use INTERSECT-like behavior with multiple subqueries
    const query = `
      SELECT DISTINCT product_id 
      FROM product_attribute_values 
      WHERE product_id IN (
        ${conditions.join(" INTERSECT ")}
      )
    `;

    const [rows] = await this.db.execute(query, params);
    return (rows as any[]).map((row) => row.product_id);
  }

  private mapRowToEntity(row: any): ProductAttributeValue {
    return new ProductAttributeValue(
      row.id,
      row.product_id,
      row.attribute_id,
      row.attribute_value_id,
      row.value_text,
      row.value_number,
      row.value_boolean,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
