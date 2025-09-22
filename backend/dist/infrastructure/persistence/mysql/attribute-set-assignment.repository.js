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
exports.MysqlAttributeSetAssignmentRepository = void 0;
const common_1 = require("@nestjs/common");
const attribute_set_assignment_entity_1 = require("../../../domain/entities/attribute-set-assignment.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlAttributeSetAssignmentRepository = class MysqlAttributeSetAssignmentRepository {
    constructor(database) {
        this.database = database;
    }
    async findAll() {
        const [rows] = await this.database.execute("SELECT * FROM attribute_set_assignments ORDER BY attribute_set_id, sort_order ASC");
        return rows.map((row) => this.mapRowToEntity(row));
    }
    async findById(id) {
        const [rows] = await this.database.execute("SELECT * FROM attribute_set_assignments WHERE id = ?", [id]);
        return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
    }
    async findByAttributeSetId(attributeSetId) {
        const [rows] = await this.database.execute("SELECT * FROM attribute_set_assignments WHERE attribute_set_id = ? ORDER BY sort_order ASC", [attributeSetId]);
        return rows.map((row) => this.mapRowToEntity(row));
    }
    async findByAttributeId(attributeId) {
        const [rows] = await this.database.execute("SELECT * FROM attribute_set_assignments WHERE attribute_id = ? ORDER BY sort_order ASC", [attributeId]);
        return rows.map((row) => this.mapRowToEntity(row));
    }
    async findByAttributeSetIdAndAttributeId(attributeSetId, attributeId) {
        const [rows] = await this.database.execute("SELECT * FROM attribute_set_assignments WHERE attribute_set_id = ? AND attribute_id = ?", [attributeSetId, attributeId]);
        return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
    }
    async create(assignment) {
        const [result] = await this.database.execute(`INSERT INTO attribute_set_assignments (attribute_set_id, attribute_id, sort_order, is_required, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`, [
            assignment.attributeSetId,
            assignment.attributeId,
            assignment.sortOrder,
            assignment.isRequired,
            assignment.createdAt,
            assignment.updatedAt,
        ]);
        return new attribute_set_assignment_entity_1.AttributeSetAssignment(result.insertId, assignment.attributeSetId, assignment.attributeId, assignment.sortOrder, assignment.isRequired, assignment.createdAt, assignment.updatedAt);
    }
    async update(assignment) {
        await this.database.execute(`UPDATE attribute_set_assignments SET sort_order = ?, is_required = ?, updated_at = ? 
       WHERE id = ?`, [
            assignment.sortOrder,
            assignment.isRequired,
            assignment.updatedAt,
            assignment.id,
        ]);
        return assignment;
    }
    async delete(id) {
        await this.database.execute("DELETE FROM attribute_set_assignments WHERE id = ?", [id]);
    }
    async deleteByAttributeSetId(attributeSetId) {
        await this.database.execute("DELETE FROM attribute_set_assignments WHERE attribute_set_id = ?", [attributeSetId]);
    }
    async deleteByAttributeId(attributeId) {
        await this.database.execute("DELETE FROM attribute_set_assignments WHERE attribute_id = ?", [attributeId]);
    }
    async existsByAttributeSetIdAndAttributeId(attributeSetId, attributeId, excludeId) {
        let query = "SELECT COUNT(*) as count FROM attribute_set_assignments WHERE attribute_set_id = ? AND attribute_id = ?";
        const params = [attributeSetId, attributeId];
        if (excludeId) {
            query += " AND id != ?";
            params.push(excludeId);
        }
        const [rows] = await this.database.execute(query, params);
        return Number(rows[0].count) > 0;
    }
    mapRowToEntity(row) {
        return new attribute_set_assignment_entity_1.AttributeSetAssignment(row.id, row.attribute_set_id, row.attribute_id, row.sort_order, row.is_required, row.created_at, row.updated_at);
    }
};
exports.MysqlAttributeSetAssignmentRepository = MysqlAttributeSetAssignmentRepository;
exports.MysqlAttributeSetAssignmentRepository = MysqlAttributeSetAssignmentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlAttributeSetAssignmentRepository);
//# sourceMappingURL=attribute-set-assignment.repository.js.map