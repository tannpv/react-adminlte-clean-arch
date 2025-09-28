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
exports.MysqlFileDirectoryRepository = void 0;
const common_1 = require("@nestjs/common");
const file_directory_entity_1 = require("../../../domain/entities/file-directory.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlFileDirectoryRepository = class MysqlFileDirectoryRepository {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        const [rows] = await this.db.execute('SELECT * FROM file_directories WHERE id = ? LIMIT 1', [id]);
        if (!rows.length)
            return null;
        return this.hydrate(rows[0]);
    }
    async findByIds(ids) {
        if (!ids.length)
            return [];
        const placeholders = ids.map(() => '?').join(', ');
        const [rows] = await this.db.execute(`SELECT * FROM file_directories WHERE id IN (${placeholders})`, ids);
        return rows.map((row) => this.hydrate(row));
    }
    async findChildren(ownerId, parentId) {
        const [rows] = await this.db.execute('SELECT * FROM file_directories WHERE owner_id = ? AND ((parent_id IS NULL AND ? IS NULL) OR parent_id = ?) ORDER BY name ASC', [ownerId, parentId, parentId]);
        return rows.map((row) => this.hydrate(row));
    }
    async findRoot(ownerId) {
        return this.findChildren(ownerId, null);
    }
    async findByParent(parentId) {
        const [rows] = await this.db.execute('SELECT * FROM file_directories WHERE (parent_id IS NULL AND ? IS NULL) OR parent_id = ? ORDER BY name ASC', [parentId, parentId]);
        return rows.map((row) => this.hydrate(row));
    }
    async create(directory) {
        const [result] = await this.db.execute('INSERT INTO file_directories (owner_id, parent_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [directory.ownerId, directory.parentId, directory.name, directory.createdAt, directory.updatedAt]);
        const id = result.insertId;
        return (await this.findById(id)) ?? directory.clone();
    }
    async update(directory) {
        await this.db.execute('UPDATE file_directories SET parent_id = ?, name = ?, updated_at = ? WHERE id = ?', [directory.parentId, directory.name, directory.updatedAt, directory.id]);
        return (await this.findById(directory.id)) ?? directory.clone();
    }
    async remove(id) {
        await this.db.execute('DELETE FROM file_directories WHERE id = ?', [id]);
    }
    hydrate(row) {
        return new file_directory_entity_1.FileDirectory(row.id, row.owner_id, row.name, row.parent_id, new Date(row.created_at), new Date(row.updated_at));
    }
};
exports.MysqlFileDirectoryRepository = MysqlFileDirectoryRepository;
exports.MysqlFileDirectoryRepository = MysqlFileDirectoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlFileDirectoryRepository);
//# sourceMappingURL=mysql-file-directory.repository.js.map