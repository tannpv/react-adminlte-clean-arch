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
exports.MysqlAttributeValueRepository = void 0;
const common_1 = require("@nestjs/common");
const attribute_value_entity_1 = require("../../../domain/entities/attribute-value.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlAttributeValueRepository = class MysqlAttributeValueRepository {
    constructor(database) {
        this.database = database;
    }
    async findAll() {
        const [rows] = await this.database.execute("SELECT * FROM attribute_values ORDER BY attribute_id, sort_order ASC");
        return rows.map((row) => this.mapRowToEntity(row));
    }
    async findById(id) {
        const [rows] = await this.database.execute("SELECT * FROM attribute_values WHERE id = ?", [id]);
        return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
    }
    async findByAttributeId(attributeId) {
        const [rows] = await this.database.execute("SELECT * FROM attribute_values WHERE attribute_id = ? ORDER BY sort_order ASC", [attributeId]);
        return rows.map((row) => this.mapRowToEntity(row));
    }
    async findByAttributeIdAndValueCode(attributeId, valueCode) {
        const [rows] = await this.database.execute("SELECT * FROM attribute_values WHERE attribute_id = ? AND value_code = ?", [attributeId, valueCode]);
        return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
    }
    async create(attributeValue) {
        const [result] = await this.database.execute(`INSERT INTO attribute_values (attribute_id, value_code, label, sort_order) 
       VALUES (?, ?, ?, ?)`, [
            attributeValue.attributeId,
            attributeValue.valueCode,
            attributeValue.label,
            attributeValue.sortOrder,
        ]);
        return new attribute_value_entity_1.AttributeValue(result.insertId, attributeValue.attributeId, attributeValue.valueCode, attributeValue.label, attributeValue.sortOrder);
    }
    async update(attributeValue) {
        await this.database.execute(`UPDATE attribute_values SET value_code = ?, label = ?, sort_order = ? 
       WHERE id = ?`, [
            attributeValue.valueCode,
            attributeValue.label,
            attributeValue.sortOrder,
            attributeValue.id,
        ]);
        return attributeValue;
    }
    async delete(id) {
        await this.database.execute("DELETE FROM attribute_values WHERE id = ?", [
            id,
        ]);
    }
    async deleteByAttributeId(attributeId) {
        await this.database.execute("DELETE FROM attribute_values WHERE attribute_id = ?", [attributeId]);
    }
    async existsByAttributeIdAndValueCode(attributeId, valueCode, excludeId) {
        let query = "SELECT COUNT(*) as count FROM attribute_values WHERE attribute_id = ? AND value_code = ?";
        const params = [attributeId, valueCode];
        if (excludeId) {
            query += " AND id != ?";
            params.push(excludeId);
        }
        const [rows] = await this.database.execute(query, params);
        return Number(rows[0].count) > 0;
    }
    mapRowToEntity(row) {
        return new attribute_value_entity_1.AttributeValue(row.id, row.attribute_id, row.value_code, row.label, row.sort_order);
    }
};
exports.MysqlAttributeValueRepository = MysqlAttributeValueRepository;
exports.MysqlAttributeValueRepository = MysqlAttributeValueRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlAttributeValueRepository);
//# sourceMappingURL=attribute-value.repository.js.map