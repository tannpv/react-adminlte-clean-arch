"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlProductRepository = void 0;
const common_1 = require("@nestjs/common");
const category_entity_1 = require("../../../domain/entities/category.entity");
const product_entity_1 = require("../../../domain/entities/product.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlProductRepository = class MysqlProductRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll(search) {
        let query = "SELECT * FROM products";
        const params = [];
        if (search?.trim()) {
            query +=
                " WHERE LOWER(name) LIKE LOWER(?) OR LOWER(sku) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)";
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        query += " ORDER BY updated_at DESC";
        const [rows] = await this.db.execute(query, params);
        return Promise.all(rows.map((row) => this.hydrate(row)));
    }
    async findById(id) {
        const [rows] = await this.db.execute("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
        if (!rows.length)
            return null;
        return this.hydrate(rows[0]);
    }
    async findBySku(sku) {
        const [rows] = await this.db.execute("SELECT * FROM products WHERE sku = ? LIMIT 1", [sku]);
        if (!rows.length)
            return null;
        return this.hydrate(rows[0]);
    }
    async create(product) {
        const now = new Date();
        const [result] = await this.db.execute(`INSERT INTO products (sku, name, description, price_cents, currency, status, type, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
        ]);
        const createdId = result.insertId;
        await this.replaceCategories(createdId, product.categoryIds);
        const created = await this.findById(createdId);
        if (!created)
            throw new Error("Failed to create product");
        return created;
    }
    async update(product) {
        const now = new Date();
        await this.db.execute(`UPDATE products SET sku = ?, name = ?, description = ?, price_cents = ?, currency = ?, status = ?, type = ?, metadata = ?, updated_at = ?
       WHERE id = ?`, [
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
        ]);
        await this.replaceCategories(product.id, product.categoryIds);
        const updated = await this.findById(product.id);
        if (!updated)
            throw new Error("Failed to update product");
        return updated;
    }
    async remove(id) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        await this.db.execute("DELETE FROM products WHERE id = ?", [id]);
        return existing;
    }
    async nextId() {
        const [rows] = await this.db.execute("SELECT AUTO_INCREMENT as next_id FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?", [this.db.getDatabaseName(), "products"]);
        return Number(rows[0]?.next_id ?? 1);
    }
    async hydrate(row) {
        const categories = await this.loadCategories(row.id);
        return new product_entity_1.Product({
            id: row.id,
            sku: row.sku,
            name: row.name,
            description: row.description,
            priceCents: row.price_cents,
            currency: row.currency,
            status: row.status,
            metadata: row.metadata ? JSON.parse(row.metadata) : null,
            categories,
            type: row.type,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }
    async loadCategories(productId) {
        const [rows] = await this.db.execute(`SELECT c.id as category_id, c.name, c.parent_id
       FROM product_categories pc
       INNER JOIN categories c ON c.id = pc.category_id
       WHERE pc.product_id = ?
       ORDER BY c.name ASC`, [productId]);
        return rows.map((row) => new category_entity_1.Category(row.category_id, row.name, row.parent_id));
    }
    async replaceCategories(productId, categoryIds) {
        await this.db.execute("DELETE FROM product_categories WHERE product_id = ?", [productId]);
        if (!categoryIds.length)
            return;
        const placeholders = categoryIds.map(() => "(?, ?)").join(", ");
        const params = categoryIds.flatMap((categoryId) => [productId, categoryId]);
        await this.db.execute(`INSERT INTO product_categories (product_id, category_id) VALUES ${placeholders}`, params);
    }
    async advancedSearch(searchDto) {
        const { search, categoryIds, attributeIds, attributeValueIds, minPrice, maxPrice, statuses, types, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 20 } = searchDto;
        let query = `
      SELECT DISTINCT p.*
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
    `;
        const conditions = [];
        const params = [];
        if (search?.trim()) {
            conditions.push(`(LOWER(p.name) LIKE LOWER(?) OR LOWER(p.sku) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?))`);
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        if (categoryIds?.length) {
            conditions.push(`pc.category_id IN (${categoryIds.map(() => '?').join(',')})`);
            params.push(...categoryIds);
        }
        if (attributeIds?.length) {
            conditions.push(`pav.attribute_id IN (${attributeIds.map(() => '?').join(',')})`);
            params.push(...attributeIds);
        }
        if (attributeValueIds?.length) {
            conditions.push(`pav.attribute_value_id IN (${attributeValueIds.map(() => '?').join(',')})`);
            params.push(...attributeValueIds);
        }
        if (minPrice !== undefined) {
            conditions.push(`p.price_cents >= ?`);
            params.push(minPrice * 100);
        }
        if (maxPrice !== undefined) {
            conditions.push(`p.price_cents <= ?`);
            params.push(maxPrice * 100);
        }
        if (statuses?.length) {
            conditions.push(`p.status IN (${statuses.map(() => '?').join(',')})`);
            params.push(...statuses);
        }
        if (types?.length) {
            conditions.push(`p.type IN (${types.map(() => '?').join(',')})`);
            params.push(...types);
        }
        if (conditions.length) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        const validSortFields = ['name', 'price', 'created_at', 'updated_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY p.${sortField} ${order}`;
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        const [productRows] = await this.db.execute(query, params);
        let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
    `;
        if (conditions.length) {
            countQuery += ` WHERE ${conditions.join(' AND ')}`;
        }
        const [countResult] = await this.db.execute(countQuery, params.slice(0, -2));
        const total = countResult[0]?.total || 0;
        const products = await Promise.all(productRows.map(row => this.hydrate(row)));
        const facets = await this.getSearchFacets(searchDto);
        return {
            products,
            total,
            facets
        };
    }
    async getSearchFacets(searchDto) {
        const [categoryFacets] = await this.db.execute(`
      SELECT c.id, c.name, COUNT(DISTINCT pc.product_id) as count
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      LEFT JOIN products p ON pc.product_id = p.id
      GROUP BY c.id, c.name
      HAVING count > 0
      ORDER BY count DESC
    `);
        const [attributeFacets] = await this.db.execute(`
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
        const [priceRange] = await this.db.execute(`
      SELECT MIN(price_cents) as min, MAX(price_cents) as max
      FROM products
    `);
        const [statusFacets] = await this.db.execute(`
      SELECT status, COUNT(*) as count
      FROM products
      GROUP BY status
      ORDER BY count DESC
    `);
        const [typeFacets] = await this.db.execute(`
      SELECT type, COUNT(*) as count
      FROM products
      GROUP BY type
      ORDER BY count DESC
    `);
        return {
            categories: categoryFacets,
            attributes: Array.from(attributesMap.values()),
            priceRange: {
                min: (priceRange[0]?.min || 0) / 100,
                max: (priceRange[0]?.max || 0) / 100
            },
            statuses: statusFacets,
            types: typeFacets
        };
    }
};
exports.MysqlProductRepository = MysqlProductRepository;
exports.MysqlProductRepository = MysqlProductRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlProductRepository);
//# sourceMappingURL=mysql-product.repository.js.map