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
exports.MysqlAttributeRepository = void 0;
const common_1 = require("@nestjs/common");
const attribute_entity_1 = require("../../../domain/entities/attribute.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlAttributeRepository = class MysqlAttributeRepository {
    constructor(database) {
        this.database = database;
    }
    async findAll() {
        const [rows] = await this.database.execute("SELECT * FROM attributes ORDER BY name ASC");
        return rows.map((row) => this.mapRowToEntity(row));
    }
    async findById(id) {
        const [rows] = await this.database.execute("SELECT * FROM attributes WHERE id = ?", [id]);
        return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
    }
    async findByCode(code) {
        const [rows] = await this.database.execute("SELECT * FROM attributes WHERE code = ?", [code]);
        return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
    }
    async create(attribute) {
        const [result] = await this.database.execute(`INSERT INTO attributes (code, name, input_type, data_type, unit, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            attribute.code,
            attribute.name,
            attribute.inputType,
            attribute.dataType,
            attribute.unit,
            attribute.createdAt,
            attribute.updatedAt,
        ]);
        return new attribute_entity_1.Attribute(result.insertId, attribute.code, attribute.name, attribute.inputType, attribute.dataType, attribute.unit, attribute.createdAt, attribute.updatedAt);
    }
    async update(attribute) {
        await this.database.execute(`UPDATE attributes SET code = ?, name = ?, input_type = ?, data_type = ?, unit = ?, updated_at = ? 
       WHERE id = ?`, [
            attribute.code,
            attribute.name,
            attribute.inputType,
            attribute.dataType,
            attribute.unit,
            attribute.updatedAt,
            attribute.id,
        ]);
        return attribute;
    }
    async delete(id) {
        await this.database.execute("DELETE FROM attributes WHERE id = ?", [id]);
    }
    async existsByCode(code, excludeId) {
        let query = "SELECT COUNT(*) as count FROM attributes WHERE code = ?";
        const params = [code];
        if (excludeId) {
            query += " AND id != ?";
            params.push(excludeId);
        }
        const [rows] = await this.database.execute(query, params);
        return Number(rows[0].count) > 0;
    }
    mapRowToEntity(row) {
        return new attribute_entity_1.Attribute(row.id, row.code, row.name, row.input_type, row.data_type, row.unit, row.created_at, row.updated_at);
    }
};
exports.MysqlAttributeRepository = MysqlAttributeRepository;
exports.MysqlAttributeRepository = MysqlAttributeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlAttributeRepository);
//# sourceMappingURL=attribute.repository.js.map