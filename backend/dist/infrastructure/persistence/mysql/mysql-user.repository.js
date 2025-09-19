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
exports.MysqlUserRepository = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../../domain/entities/user.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlUserRepository = class MysqlUserRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const [rows] = await this.db.execute('SELECT id, name, email, password_hash FROM users ORDER BY id ASC');
        const users = await Promise.all(rows.map((row) => this.hydrateUser(row)));
        return users;
    }
    async findById(id) {
        const [rows] = await this.db.execute('SELECT id, name, email, password_hash FROM users WHERE id = ? LIMIT 1', [id]);
        if (!rows.length)
            return null;
        return this.hydrateUser(rows[0]);
    }
    async findByEmail(email) {
        const [rows] = await this.db.execute('SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [email]);
        if (!rows.length)
            return null;
        return this.hydrateUser(rows[0]);
    }
    async create(user) {
        const [result] = await this.db.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [user.name, user.email, user.passwordHash]);
        const id = result.insertId;
        await this.saveRoles(id, user.roles);
        return new user_entity_1.User(id, user.name, user.email, [...user.roles], user.passwordHash);
    }
    async update(user) {
        await this.db.execute('UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?', [user.name, user.email, user.passwordHash, user.id]);
        await this.db.execute('DELETE FROM user_roles WHERE user_id = ?', [user.id]);
        await this.saveRoles(user.id, user.roles);
        return user.clone();
    }
    async remove(id) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        await this.db.execute('DELETE FROM users WHERE id = ?', [id]);
        return existing;
    }
    async nextId() {
        const database = this.db.getDatabaseName();
        const [rows] = await this.db.execute(`SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`, [database]);
        const nextId = rows[0]?.AUTO_INCREMENT;
        return nextId ? Number(nextId) : 1;
    }
    async hydrateUser(row) {
        const [roleRows] = await this.db.execute('SELECT role_id FROM user_roles WHERE user_id = ?', [row.id]);
        const roleIds = roleRows.map((r) => Number(r.role_id));
        return new user_entity_1.User(row.id, row.name, row.email, roleIds, row.password_hash);
    }
    async saveRoles(userId, roles) {
        if (!roles || !roles.length)
            return;
        const placeholders = roles.map(() => '(?, ?)').join(', ');
        const params = roles.flatMap((roleId) => [userId, roleId]);
        await this.db.execute(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES ${placeholders}`, params);
    }
};
exports.MysqlUserRepository = MysqlUserRepository;
exports.MysqlUserRepository = MysqlUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlUserRepository);
//# sourceMappingURL=mysql-user.repository.js.map