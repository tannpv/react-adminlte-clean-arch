import { Injectable } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Category } from "../../../domain/entities/category.entity";
import {
  Product,
  ProductStatus,
  ProductType,
} from "../../../domain/entities/product.entity";
import { ProductRepository, ProductSearchResult } from "../../../domain/repositories/product.repository";
import { ProductSearchDto } from "../../../application/dto/product-search.dto";
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

interface CountRow extends RowDataPacket {
  total: number;
}

interface CategoryFacetRow extends RowDataPacket {
  id: number;
  name: string;
  count: number;
}

interface AttributeFacetRow extends RowDataPacket {
  id: number;
  name: string;
  value_id: number;
  value: string;
  count: number;
}

interface PriceRangeRow extends RowDataPacket {
  min: number;
  max: number;
}

interface StatusFacetRow extends RowDataPacket {
  status: string;
  count: number;
}

interface TypeFacetRow extends RowDataPacket {
  type: string;
  count: number;
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

  async advancedSearch(searchDto: ProductSearchDto): Promise<ProductSearchResult> {
    const {
      search,
      categoryIds,
      attributeIds,
      attributeValueIds,
      minPrice,
      maxPrice,
      statuses,
      types,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = searchDto;

    // Build the main query
    let query = `
      SELECT DISTINCT p.*
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    // Text search
    if (search?.trim()) {
      conditions.push(`(LOWER(p.name) LIKE LOWER(?) OR LOWER(p.sku) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?))`);
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (categoryIds?.length) {
      conditions.push(`pc.category_id IN (${categoryIds.map(() => '?').join(',')})`);
      params.push(...categoryIds);
    }

    // Attribute filters
    if (attributeIds?.length) {
      conditions.push(`pav.attribute_id IN (${attributeIds.map(() => '?').join(',')})`);
      params.push(...attributeIds);
    }

    if (attributeValueIds?.length) {
      conditions.push(`pav.attribute_value_id IN (${attributeValueIds.map(() => '?').join(',')})`);
      params.push(...attributeValueIds);
    }

    // Price range
    if (minPrice !== undefined) {
      conditions.push(`p.price_cents >= ?`);
      params.push(minPrice * 100); // Convert to cents
    }

    if (maxPrice !== undefined) {
      conditions.push(`p.price_cents <= ?`);
      params.push(maxPrice * 100); // Convert to cents
    }

    // Status filter
    if (statuses?.length) {
      conditions.push(`p.status IN (${statuses.map(() => '?').join(',')})`);
      params.push(...statuses);
    }

    // Type filter
    if (types?.length) {
      conditions.push(`p.type IN (${types.map(() => '?').join(',')})`);
      params.push(...types);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Sorting
    const validSortFields = ['name', 'price', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY p.${sortField} ${order}`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute main query
    const [productRows] = await this.db.execute<ProductRow[]>(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
    `;

    if (conditions.length) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    const [countResult] = await this.db.execute<CountRow[]>(countQuery, params.slice(0, -2)); // Remove limit and offset
    const total = countResult[0]?.total || 0;

    // Hydrate products
    const products = await Promise.all(productRows.map(row => this.hydrate(row)));

    // Get facets
    const facets = await this.getSearchFacets(searchDto);

    return {
      products,
      total,
      facets
    };
  }

  private async getSearchFacets(searchDto: ProductSearchDto) {
    // Get category facets
    const [categoryFacets] = await this.db.execute<CategoryFacetRow[]>(`
      SELECT c.id, c.name, COUNT(DISTINCT pc.product_id) as count
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      LEFT JOIN products p ON pc.product_id = p.id
      GROUP BY c.id, c.name
      HAVING count > 0
      ORDER BY count DESC
    `);

    // Get attribute facets
    const [attributeFacets] = await this.db.execute<AttributeFacetRow[]>(`
      SELECT a.id, a.name, av.id as value_id, av.value, COUNT(DISTINCT pav.product_id) as count
      FROM attributes a
      LEFT JOIN attribute_values av ON a.id = av.attribute_id
      LEFT JOIN product_attribute_values pav ON av.id = pav.attribute_value_id
      LEFT JOIN products p ON pav.product_id = p.id
      WHERE av.id IS NOT NULL
      GROUP BY a.id, a.name, av.id, av.value
      HAVING count > 0
      ORDER BY a.name, count DESC
    `);

    // Group attribute facets by attribute
    const attributesMap = new Map();
    attributeFacets.forEach(facet => {
      if (!attributesMap.has(facet.id)) {
        attributesMap.set(facet.id, {
          id: facet.id,
          name: facet.name,
          values: []
        });
      }
      attributesMap.get(facet.id).values.push({
        id: facet.value_id,
        value: facet.value,
        count: facet.count
      });
    });

    // Get price range
    const [priceRange] = await this.db.execute<PriceRangeRow[]>(`
      SELECT MIN(price_cents) as min, MAX(price_cents) as max
      FROM products
    `);

    // Get status facets
    const [statusFacets] = await this.db.execute<StatusFacetRow[]>(`
      SELECT status, COUNT(*) as count
      FROM products
      GROUP BY status
      ORDER BY count DESC
    `);

    // Get type facets
    const [typeFacets] = await this.db.execute<TypeFacetRow[]>(`
      SELECT type, COUNT(*) as count
      FROM products
      GROUP BY type
      ORDER BY count DESC
    `);

    return {
      categories: categoryFacets,
      attributes: Array.from(attributesMap.values()),
      priceRange: {
        min: (priceRange[0]?.min || 0) / 100, // Convert from cents
        max: (priceRange[0]?.max || 0) / 100  // Convert from cents
      },
      statuses: statusFacets,
      types: typeFacets
    };
  }
}
