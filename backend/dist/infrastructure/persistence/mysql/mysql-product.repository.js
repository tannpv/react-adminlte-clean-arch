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
    async findAll() {
        const [rows] = await this.db.execute("SELECT * FROM products ORDER BY updated_at DESC");
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
};
exports.MysqlProductRepository = MysqlProductRepository;
exports.MysqlProductRepository = MysqlProductRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlProductRepository);
//# sourceMappingURL=mysql-product.repository.js.map