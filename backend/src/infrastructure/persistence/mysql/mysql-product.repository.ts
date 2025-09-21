import { Injectable } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Category } from "../../../domain/entities/category.entity";
import {
  Product,
  ProductStatus,
  ProductType,
} from "../../../domain/entities/product.entity";
import { ProductRepository } from "../../../domain/repositories/product.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

interface ProductRow extends RowDataPacket {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  status: string;
  type: string;
  metadata: string | null;
  created_at: Date;
  updated_at: Date;
}

interface ProductCategoryRow extends RowDataPacket {
  category_id: number;
  name: string;
  parent_id: number | null;
}

@Injectable()
export class MysqlProductRepository implements ProductRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(search?: string): Promise<Product[]> {
    let query = "SELECT * FROM products";
    const params: any[] = [];

    if (search?.trim()) {
      query +=
        " WHERE LOWER(name) LIKE LOWER(?) OR LOWER(sku) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)";
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY updated_at DESC";

    const [rows] = await this.db.execute<ProductRow[]>(query, params);
    return Promise.all(rows.map((row) => this.hydrate(row)));
  }

  async findById(id: number): Promise<Product | null> {
    const [rows] = await this.db.execute<ProductRow[]>(
      "SELECT * FROM products WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows.length) return null;
    return this.hydrate(rows[0]);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const [rows] = await this.db.execute<ProductRow[]>(
      "SELECT * FROM products WHERE sku = ? LIMIT 1",
      [sku]
    );
    if (!rows.length) return null;
    return this.hydrate(rows[0]);
  }

  async create(product: Product): Promise<Product> {
    const now = new Date();
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
        now,
        now,
      ]
    );

    const createdId = result.insertId as number;
    await this.replaceCategories(createdId, product.categoryIds);

    const created = await this.findById(createdId);
    if (!created) throw new Error("Failed to create product");
    return created;
  }

  async update(product: Product): Promise<Product> {
    const now = new Date();
    await this.db.execute(
      `UPDATE products SET sku = ?, name = ?, description = ?, price_cents = ?, currency = ?, status = ?, type = ?, metadata = ?, updated_at = ?
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
      ]
    );

    await this.replaceCategories(product.id, product.categoryIds);

    const updated = await this.findById(product.id);
    if (!updated) throw new Error("Failed to update product");
    return updated;
  }

  async remove(id: number): Promise<Product | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    await this.db.execute("DELETE FROM products WHERE id = ?", [id]);
    return existing;
  }

  async nextId(): Promise<number> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT AUTO_INCREMENT as next_id FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
      [this.db.getDatabaseName(), "products"]
    );
    return Number(rows[0]?.next_id ?? 1);
  }

  private async hydrate(row: ProductRow): Promise<Product> {
    const categories = await this.loadCategories(row.id);

    return new Product({
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      priceCents: row.price_cents,
      currency: row.currency,
      status: row.status as ProductStatus,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      categories,
      type: row.type as ProductType,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  private async loadCategories(productId: number): Promise<Category[]> {
    const [rows] = await this.db.execute<ProductCategoryRow[]>(
      `SELECT c.id as category_id, c.name, c.parent_id
       FROM product_categories pc
       INNER JOIN categories c ON c.id = pc.category_id
       WHERE pc.product_id = ?
       ORDER BY c.name ASC`,
      [productId]
    );

    return rows.map(
      (row) => new Category(row.category_id, row.name, row.parent_id)
    );
  }

  private async replaceCategories(
    productId: number,
    categoryIds: number[]
  ): Promise<void> {
    await this.db.execute(
      "DELETE FROM product_categories WHERE product_id = ?",
      [productId]
    );

    if (!categoryIds.length) return;

    const placeholders = categoryIds.map(() => "(?, ?)").join(", ");
    const params = categoryIds.flatMap((categoryId) => [productId, categoryId]);
    await this.db.execute(
      `INSERT INTO product_categories (product_id, category_id) VALUES ${placeholders}`,
      params
    );
  }
}
