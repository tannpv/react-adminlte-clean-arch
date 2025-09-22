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
exports.MysqlProductVariantRepository = void 0;
const common_1 = require("@nestjs/common");
const product_variant_entity_1 = require("../../../domain/entities/product-variant.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlProductVariantRepository = class MysqlProductVariantRepository {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        const [rows] = await this.db.execute('SELECT * FROM product_variants WHERE id = ?', [id]);
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }
        return this.mapRowToEntity(rows[0]);
    }
    async findByProductId(productId) {
        const [rows] = await this.db.execute('SELECT * FROM product_variants WHERE product_id = ? ORDER BY created_at', [productId]);
        return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row)) : [];
    }
    async findBySku(sku) {
        const [rows] = await this.db.execute('SELECT * FROM product_variants WHERE sku = ?', [sku]);
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }
        return this.mapRowToEntity(rows[0]);
    }
    async save(productVariant) {
        const [result] = await this.db.execute(`INSERT INTO product_variants 
       (product_id, sku, name, price_cents, currency, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            productVariant.productId,
            productVariant.sku,
            productVariant.name,
            productVariant.priceCents,
            productVariant.currency,
            productVariant.status,
            productVariant.createdAt,
            productVariant.updatedAt
        ]);
        const insertResult = result;
        return new product_variant_entity_1.ProductVariant(insertResult.insertId, productVariant.productId, productVariant.sku, productVariant.name, productVariant.priceCents, productVariant.currency, productVariant.status, productVariant.createdAt, productVariant.updatedAt);
    }
    async update(id, productVariant) {
        await this.db.execute(`UPDATE product_variants 
       SET sku = ?, name = ?, price_cents = ?, currency = ?, status = ?, updated_at = ?
       WHERE id = ?`, [
            productVariant.sku,
            productVariant.name,
            productVariant.priceCents,
            productVariant.currency,
            productVariant.status,
            productVariant.updatedAt,
            id
        ]);
        return new product_variant_entity_1.ProductVariant(id, productVariant.productId, productVariant.sku, productVariant.name, productVariant.priceCents, productVariant.currency, productVariant.status, productVariant.createdAt, productVariant.updatedAt);
    }
    async delete(id) {
        await this.db.execute('DELETE FROM product_variants WHERE id = ?', [id]);
    }
    async deleteByProductId(productId) {
        await this.db.execute('DELETE FROM product_variants WHERE product_id = ?', [productId]);
    }
    mapRowToEntity(row) {
        return new product_variant_entity_1.ProductVariant(row.id, row.product_id, row.sku, row.name, row.price_cents, row.currency, row.status, new Date(row.created_at), new Date(row.updated_at));
    }
};
exports.MysqlProductVariantRepository = MysqlProductVariantRepository;
exports.MysqlProductVariantRepository = MysqlProductVariantRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlProductVariantRepository);
//# sourceMappingURL=product-variant.repository.js.map