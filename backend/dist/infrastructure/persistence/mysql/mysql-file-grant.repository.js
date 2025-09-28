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
exports.MysqlFileGrantRepository = void 0;
const common_1 = require("@nestjs/common");
const file_grant_entity_1 = require("../../../domain/entities/file-grant.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlFileGrantRepository = class MysqlFileGrantRepository {
    constructor(db) {
        this.db = db;
    }
    async findByEntity(entityType, entityId) {
        const [rows] = await this.db.execute('SELECT * FROM file_grants WHERE entity_type = ? AND entity_id = ?', [entityType, entityId]);
        return rows.map((row) => this.hydrate(row));
    }
    async findForRole(entityType, entityId, roleIds) {
        if (!roleIds.length)
            return [];
        const placeholders = roleIds.map(() => '?').join(', ');
        const [rows] = await this.db.execute(`SELECT * FROM file_grants WHERE entity_type = ? AND entity_id = ? AND role_id IN (${placeholders})`, [entityType, entityId, ...roleIds]);
        return rows.map((row) => this.hydrate(row));
    }
    async create(grant) {
        const [result] = await this.db.execute('INSERT INTO file_grants (entity_type, entity_id, role_id, access) VALUES (?, ?, ?, ?)', [grant.entityType, grant.entityId, grant.roleId, grant.access]);
        const id = result.insertId;
        return new file_grant_entity_1.FileGrant(id, grant.entityType, grant.entityId, grant.roleId, grant.access);
    }
    async remove(id) {
        await this.db.execute('DELETE FROM file_grants WHERE id = ?', [id]);
    }
    async removeForEntity(entityType, entityId) {
        await this.db.execute('DELETE FROM file_grants WHERE entity_type = ? AND entity_id = ?', [entityType, entityId]);
    }
    hydrate(row) {
        return new file_grant_entity_1.FileGrant(row.id, row.entity_type, row.entity_id, row.role_id, row.access);
    }
};
exports.MysqlFileGrantRepository = MysqlFileGrantRepository;
exports.MysqlFileGrantRepository = MysqlFileGrantRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlFileGrantRepository);
//# sourceMappingURL=mysql-file-grant.repository.js.map