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
exports.MysqlAttributeSetRepository = void 0;
const common_1 = require("@nestjs/common");
const attribute_set_entity_1 = require("../../../domain/entities/attribute-set.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlAttributeSetRepository = class MysqlAttributeSetRepository {
    constructor(database) {
        this.database = database;
    }
    async findAll() {
        const [rows] = await this.database.execute("SELECT * FROM attribute_sets ORDER BY sort_order ASC, name ASC");
        return rows.map((row) => this.mapRowToEntity(row));
    }
    async findById(id) {
        const [rows] = await this.database.execute("SELECT * FROM attribute_sets WHERE id = ?", [id]);
        return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
    }
    async findByName(name) {
        const [rows] = await this.database.execute("SELECT * FROM attribute_sets WHERE name = ?", [name]);
        return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
    }
    async create(attributeSet) {
        const [result] = await this.database.execute(`INSERT INTO attribute_sets (name, description, is_system, sort_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`, [
            attributeSet.name,
            attributeSet.description,
            attributeSet.isSystem,
            attributeSet.sortOrder,
            attributeSet.createdAt,
            attributeSet.updatedAt,
        ]);
        return new attribute_set_entity_1.AttributeSet(result.insertId, attributeSet.name, attributeSet.description, attributeSet.isSystem, attributeSet.sortOrder, attributeSet.createdAt, attributeSet.updatedAt, attributeSet.attributes);
    }
    async update(attributeSet) {
        await this.database.execute(`UPDATE attribute_sets SET name = ?, description = ?, is_system = ?, sort_order = ?, updated_at = ? 
       WHERE id = ?`, [
            attributeSet.name,
            attributeSet.description,
            attributeSet.isSystem,
            attributeSet.sortOrder,
            attributeSet.updatedAt,
            attributeSet.id,
        ]);
        return attributeSet;
    }
    async delete(id) {
        await this.database.execute("DELETE FROM attribute_sets WHERE id = ?", [
            id,
        ]);
    }
    async existsByName(name, excludeId) {
        let query = "SELECT COUNT(*) as count FROM attribute_sets WHERE name = ?";
        const params = [name];
        if (excludeId) {
            query += " AND id != ?";
            params.push(excludeId);
        }
        const [rows] = await this.database.execute(query, params);
        return Number(rows[0].count) > 0;
    }
    mapRowToEntity(row) {
        return new attribute_set_entity_1.AttributeSet(row.id, row.name, row.description, row.is_system, row.sort_order, row.created_at, row.updated_at, []);
    }
};
exports.MysqlAttributeSetRepository = MysqlAttributeSetRepository;
exports.MysqlAttributeSetRepository = MysqlAttributeSetRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlAttributeSetRepository);
//# sourceMappingURL=attribute-set.repository.js.map