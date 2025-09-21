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
exports.MysqlCategoryRepository = void 0;
const common_1 = require("@nestjs/common");
const category_entity_1 = require("../../../domain/entities/category.entity");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlCategoryRepository = class MysqlCategoryRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll(search) {
        let query = 'SELECT id, name, parent_id FROM categories';
        const params = [];
        if (search?.trim()) {
            query += ' WHERE LOWER(name) LIKE LOWER(?)';
            params.push(`%${search.trim()}%`);
        }
        query += ' ORDER BY name ASC';
        const [rows] = await this.db.execute(query, params);
        return rows.map((row) => new category_entity_1.Category(row.id, row.name, row.parent_id ?? null));
    }
    async findById(id) {
        const [rows] = await this.db.execute('SELECT id, name, parent_id FROM categories WHERE id = ? LIMIT 1', [id]);
        if (!rows.length)
            return null;
        return new category_entity_1.Category(rows[0].id, rows[0].name, rows[0].parent_id ?? null);
    }
    async findByIds(ids) {
        if (!ids.length)
            return [];
        const placeholders = ids.map(() => '?').join(', ');
        const [rows] = await this.db.execute(`SELECT id, name, parent_id FROM categories WHERE id IN (${placeholders})`, ids);
        return rows.map((row) => new category_entity_1.Category(row.id, row.name, row.parent_id ?? null));
    }
    async findByName(name) {
        const [rows] = await this.db.execute('SELECT id, name, parent_id FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1', [name]);
        if (!rows.length)
            return null;
        const row = rows[0];
        return new category_entity_1.Category(row.id, row.name, row.parent_id ?? null);
    }
    async create(category) {
        const [result] = await this.db.execute('INSERT INTO categories (name, parent_id) VALUES (?, ?)', [category.name, category.parentId ?? null]);
        const id = result.insertId;
        return new category_entity_1.Category(id, category.name, category.parentId ?? null);
    }
    async update(category) {
        await this.db.execute('UPDATE categories SET name = ?, parent_id = ? WHERE id = ?', [category.name, category.parentId ?? null, category.id]);
        return category.clone();
    }
    async remove(id) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        await this.db.execute('DELETE FROM categories WHERE id = ?', [id]);
        return existing;
    }
    async nextId() {
        const database = this.db.getDatabaseName();
        const [rows] = await this.db.execute(`SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories'`, [database]);
        const nextId = rows[0]?.AUTO_INCREMENT;
        return nextId ? Number(nextId) : 1;
    }
};
exports.MysqlCategoryRepository = MysqlCategoryRepository;
exports.MysqlCategoryRepository = MysqlCategoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlCategoryRepository);
//# sourceMappingURL=mysql-category.repository.js.map