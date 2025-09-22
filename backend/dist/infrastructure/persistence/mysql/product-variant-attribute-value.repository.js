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
exports.MysqlProductVariantAttributeValueRepository = void 0;
const common_1 = require("@nestjs/common");
const product_variant_attribute_value_entity_1 = require("../../../domain/entities/product-variant-attribute-value.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlProductVariantAttributeValueRepository = class MysqlProductVariantAttributeValueRepository {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        const [rows] = await this.db.execute('SELECT * FROM product_variant_attribute_values WHERE id = ?', [id]);
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }
        return this.mapRowToEntity(rows[0]);
    }
    async findByVariantId(variantId) {
        const [rows] = await this.db.execute('SELECT * FROM product_variant_attribute_values WHERE variant_id = ? ORDER BY created_at', [variantId]);
        return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row)) : [];
    }
    async findByAttributeId(attributeId) {
        const [rows] = await this.db.execute('SELECT * FROM product_variant_attribute_values WHERE attribute_id = ? ORDER BY created_at', [attributeId]);
        return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row)) : [];
    }
    async findByVariantAndAttribute(variantId, attributeId) {
        const [rows] = await this.db.execute('SELECT * FROM product_variant_attribute_values WHERE variant_id = ? AND attribute_id = ?', [variantId, attributeId]);
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }
        return this.mapRowToEntity(rows[0]);
    }
    async save(productVariantAttributeValue) {
        const [result] = await this.db.execute(`INSERT INTO product_variant_attribute_values 
       (variant_id, attribute_id, value_text, value_number, value_boolean, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            productVariantAttributeValue.variantId,
            productVariantAttributeValue.attributeId,
            productVariantAttributeValue.valueText,
            productVariantAttributeValue.valueNumber,
            productVariantAttributeValue.valueBoolean,
            productVariantAttributeValue.createdAt,
            productVariantAttributeValue.updatedAt
        ]);
        const insertResult = result;
        return new product_variant_attribute_value_entity_1.ProductVariantAttributeValue(insertResult.insertId, productVariantAttributeValue.variantId, productVariantAttributeValue.attributeId, productVariantAttributeValue.valueText, productVariantAttributeValue.valueNumber, productVariantAttributeValue.valueBoolean, productVariantAttributeValue.createdAt, productVariantAttributeValue.updatedAt);
    }
    async update(id, productVariantAttributeValue) {
        await this.db.execute(`UPDATE product_variant_attribute_values 
       SET value_text = ?, value_number = ?, value_boolean = ?, updated_at = ?
       WHERE id = ?`, [
            productVariantAttributeValue.valueText,
            productVariantAttributeValue.valueNumber,
            productVariantAttributeValue.valueBoolean,
            productVariantAttributeValue.updatedAt,
            id
        ]);
        return new product_variant_attribute_value_entity_1.ProductVariantAttributeValue(id, productVariantAttributeValue.variantId, productVariantAttributeValue.attributeId, productVariantAttributeValue.valueText, productVariantAttributeValue.valueNumber, productVariantAttributeValue.valueBoolean, productVariantAttributeValue.createdAt, productVariantAttributeValue.updatedAt);
    }
    async delete(id) {
        await this.db.execute('DELETE FROM product_variant_attribute_values WHERE id = ?', [id]);
    }
    async deleteByVariantId(variantId) {
        await this.db.execute('DELETE FROM product_variant_attribute_values WHERE variant_id = ?', [variantId]);
    }
    async deleteByVariantAndAttribute(variantId, attributeId) {
        await this.db.execute('DELETE FROM product_variant_attribute_values WHERE variant_id = ? AND attribute_id = ?', [variantId, attributeId]);
    }
    mapRowToEntity(row) {
        return new product_variant_attribute_value_entity_1.ProductVariantAttributeValue(row.id, row.variant_id, row.attribute_id, row.value_text, row.value_number, row.value_boolean, new Date(row.created_at), new Date(row.updated_at));
    }
};
exports.MysqlProductVariantAttributeValueRepository = MysqlProductVariantAttributeValueRepository;
exports.MysqlProductVariantAttributeValueRepository = MysqlProductVariantAttributeValueRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlProductVariantAttributeValueRepository);
//# sourceMappingURL=product-variant-attribute-value.repository.js.map