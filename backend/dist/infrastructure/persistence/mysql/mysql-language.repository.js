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
exports.MysqlLanguageRepository = void 0;
const common_1 = require("@nestjs/common");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlLanguageRepository = class MysqlLanguageRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const [rows] = await this.db.execute("SELECT * FROM languages ORDER BY isDefault DESC, name ASC");
        return rows;
    }
    async findById(id) {
        const [rows] = await this.db.execute("SELECT * FROM languages WHERE id = ?", [id]);
        return rows[0] || null;
    }
    async findByCode(code) {
        const [rows] = await this.db.execute("SELECT * FROM languages WHERE code = ?", [code]);
        return rows[0] || null;
    }
    async findActive() {
        const [rows] = await this.db.execute("SELECT * FROM languages WHERE isActive = true ORDER BY isDefault DESC, name ASC");
        return rows;
    }
    async findDefault() {
        const [rows] = await this.db.execute("SELECT * FROM languages WHERE isDefault = true AND isActive = true LIMIT 1");
        return rows[0] || null;
    }
    async save(language) {
        const result = await this.db.execute(`INSERT INTO languages (code, name, nativeName, isDefault, isActive, flagIcon, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
            language.code,
            language.name,
            language.nativeName,
            language.isDefault,
            language.isActive,
            language.flagIcon,
        ]);
        const savedLanguage = await this.findById(result.insertId);
        return savedLanguage;
    }
    async update(id, language) {
        const fields = [];
        const values = [];
        if (language.code !== undefined) {
            fields.push("code = ?");
            values.push(language.code);
        }
        if (language.name !== undefined) {
            fields.push("name = ?");
            values.push(language.name);
        }
        if (language.nativeName !== undefined) {
            fields.push("nativeName = ?");
            values.push(language.nativeName);
        }
        if (language.isDefault !== undefined) {
            fields.push("isDefault = ?");
            values.push(language.isDefault);
        }
        if (language.isActive !== undefined) {
            fields.push("isActive = ?");
            values.push(language.isActive);
        }
        if (language.flagIcon !== undefined) {
            fields.push("flagIcon = ?");
            values.push(language.flagIcon);
        }
        fields.push("updatedAt = NOW()");
        values.push(id);
        await this.db.execute(`UPDATE languages SET ${fields.join(", ")} WHERE id = ?`, values);
        const updatedLanguage = await this.findById(id);
        return updatedLanguage;
    }
    async delete(id) {
        await this.db.execute("DELETE FROM languages WHERE id = ?", [id]);
    }
};
exports.MysqlLanguageRepository = MysqlLanguageRepository;
exports.MysqlLanguageRepository = MysqlLanguageRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlLanguageRepository);
//# sourceMappingURL=mysql-language.repository.js.map