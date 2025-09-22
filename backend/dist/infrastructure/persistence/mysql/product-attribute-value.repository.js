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
exports.MysqlProductAttributeValueRepository = void 0;
const common_1 = require("@nestjs/common");
const product_attribute_value_entity_1 = require("../../../domain/entities/product-attribute-value.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlProductAttributeValueRepository = class MysqlProductAttributeValueRepository {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        const [rows] = await this.db.execute('SELECT * FROM product_attribute_values WHERE id = ?', [id]);
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }
        return this.mapRowToEntity(rows[0]);
    }
    async findByProductId(productId) {
        const [rows] = await this.db.execute('SELECT * FROM product_attribute_values WHERE product_id = ? ORDER BY created_at', [productId]);
        return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row)) : [];
    }
    async findByAttributeId(attributeId) {
        const [rows] = await this.db.execute('SELECT * FROM product_attribute_values WHERE attribute_id = ? ORDER BY created_at', [attributeId]);
        return Array.isArray(rows) ? rows.map(row => this.mapRowToEntity(row)) : [];
    }
    async findByProductAndAttribute(productId, attributeId) {
        const [rows] = await this.db.execute('SELECT * FROM product_attribute_values WHERE product_id = ? AND attribute_id = ?', [productId, attributeId]);
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }
        return this.mapRowToEntity(rows[0]);
    }
    async save(productAttributeValue) {
        const [result] = await this.db.execute(`INSERT INTO product_attribute_values 
       (product_id, attribute_id, value_text, value_number, value_boolean, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            productAttributeValue.productId,
            productAttributeValue.attributeId,
            productAttributeValue.valueText,
            productAttributeValue.valueNumber,
            productAttributeValue.valueBoolean,
            productAttributeValue.createdAt,
            productAttributeValue.updatedAt
        ]);
        const insertResult = result;
        return new product_attribute_value_entity_1.ProductAttributeValue(insertResult.insertId, productAttributeValue.productId, productAttributeValue.attributeId, productAttributeValue.valueText, productAttributeValue.valueNumber, productAttributeValue.valueBoolean, productAttributeValue.createdAt, productAttributeValue.updatedAt);
    }
    async update(id, productAttributeValue) {
        await this.db.execute(`UPDATE product_attribute_values 
       SET value_text = ?, value_number = ?, value_boolean = ?, updated_at = ?
       WHERE id = ?`, [
            productAttributeValue.valueText,
            productAttributeValue.valueNumber,
            productAttributeValue.valueBoolean,
            productAttributeValue.updatedAt,
            id
        ]);
        return new product_attribute_value_entity_1.ProductAttributeValue(id, productAttributeValue.productId, productAttributeValue.attributeId, productAttributeValue.valueText, productAttributeValue.valueNumber, productAttributeValue.valueBoolean, productAttributeValue.createdAt, productAttributeValue.updatedAt);
    }
    async delete(id) {
        await this.db.execute('DELETE FROM product_attribute_values WHERE id = ?', [id]);
    }
    async deleteByProductId(productId) {
        await this.db.execute('DELETE FROM product_attribute_values WHERE product_id = ?', [productId]);
    }
    async deleteByProductAndAttribute(productId, attributeId) {
        await this.db.execute('DELETE FROM product_attribute_values WHERE product_id = ? AND attribute_id = ?', [productId, attributeId]);
    }
    mapRowToEntity(row) {
        return new product_attribute_value_entity_1.ProductAttributeValue(row.id, row.product_id, row.attribute_id, row.value_text, row.value_number, row.value_boolean, new Date(row.created_at), new Date(row.updated_at));
    }
};
exports.MysqlProductAttributeValueRepository = MysqlProductAttributeValueRepository;
exports.MysqlProductAttributeValueRepository = MysqlProductAttributeValueRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlProductAttributeValueRepository);
//# sourceMappingURL=product-attribute-value.repository.js.map