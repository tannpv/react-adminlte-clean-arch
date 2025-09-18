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
exports.MysqlRoleRepository = void 0;
const common_1 = require("@nestjs/common");
const role_entity_1 = require("../../../domain/entities/role.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlRoleRepository = class MysqlRoleRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const [rows] = await this.db.execute('SELECT id, name FROM roles ORDER BY id ASC');
        return Promise.all(rows.map((row) => this.hydrateRole(row)));
    }
    async findById(id) {
        const [rows] = await this.db.execute('SELECT id, name FROM roles WHERE id = ? LIMIT 1', [id]);
        if (!rows.length)
            return null;
        return this.hydrateRole(rows[0]);
    }
    async findByIds(ids) {
        if (!ids.length)
            return [];
        const placeholders = ids.map(() => '?').join(', ');
        const [rows] = await this.db.execute(`SELECT id, name FROM roles WHERE id IN (${placeholders})`, ids);
        return Promise.all(rows.map((row) => this.hydrateRole(row)));
    }
    async findByName(name) {
        const [rows] = await this.db.execute('SELECT id, name FROM roles WHERE LOWER(name) = LOWER(?) LIMIT 1', [name]);
        if (!rows.length)
            return null;
        return this.hydrateRole(rows[0]);
    }
    async create(role) {
        const [result] = await this.db.execute('INSERT INTO roles (name) VALUES (?)', [role.name]);
        const id = result.insertId;
        await this.replacePermissions(id, role.permissions);
        return new role_entity_1.Role(id, role.name, [...role.permissions]);
    }
    async update(role) {
        await this.db.execute('UPDATE roles SET name = ? WHERE id = ?', [role.name, role.id]);
        await this.replacePermissions(role.id, role.permissions);
        return role.clone();
    }
    async remove(id) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        await this.db.execute('DELETE FROM roles WHERE id = ?', [id]);
        return existing;
    }
    async nextId() {
        const database = this.db.getDatabaseName();
        const [rows] = await this.db.execute(`SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'roles'`, [database]);
        const nextId = rows[0]?.AUTO_INCREMENT;
        return nextId ? Number(nextId) : 1;
    }
    async hydrateRole(row) {
        const [permissionRows] = await this.db.execute('SELECT permission FROM role_permissions WHERE role_id = ? ORDER BY permission ASC', [row.id]);
        const permissions = permissionRows.map((perm) => perm.permission);
        return new role_entity_1.Role(row.id, row.name, permissions);
    }
    async replacePermissions(roleId, permissions) {
        await this.db.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
        if (!permissions || !permissions.length)
            return;
        const uniquePermissions = [...new Set(permissions)];
        const placeholders = uniquePermissions.map(() => '(?, ?)').join(', ');
        const params = uniquePermissions.flatMap((perm) => [roleId, perm]);
        await this.db.execute(`INSERT INTO role_permissions (role_id, permission) VALUES ${placeholders}`, params);
    }
};
exports.MysqlRoleRepository = MysqlRoleRepository;
exports.MysqlRoleRepository = MysqlRoleRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlRoleRepository);
//# sourceMappingURL=mysql-role.repository.js.map