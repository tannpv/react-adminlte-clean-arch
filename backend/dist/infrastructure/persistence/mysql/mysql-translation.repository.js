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
exports.MysqlTranslationNamespaceRepository = exports.MysqlTranslationKeyRepository = exports.MysqlTranslationRepository = void 0;
const common_1 = require("@nestjs/common");
const mysql_database_service_1 = require("./mysql-database.service");
let MysqlTranslationRepository = class MysqlTranslationRepository {
    constructor(db) {
        this.db = db;
    }
    async findByLanguageAndNamespace(languageCode, namespace) {
        const [rows] = await this.db.execute(`SELECT 
        tk.key_path,
        t.value
      FROM translations t
      INNER JOIN translation_keys tk ON t.keyId = tk.id
      INNER JOIN languages l ON t.languageId = l.id
      INNER JOIN translation_namespaces tn ON tk.namespaceId = tn.id
      WHERE l.code = ? AND tn.name = ? AND t.isActive = true AND tk.isActive = true
      ORDER BY tk.key_path`, [languageCode, namespace]);
        const translations = {};
        rows.forEach((row) => {
            translations[row.key_path] = row.value;
        });
        return translations;
    }
    async findByLanguageAndKeyPath(languageCode, keyPath) {
        const [rows] = await this.db.execute(`SELECT t.value
      FROM translations t
      INNER JOIN translation_keys tk ON t.keyId = tk.id
      INNER JOIN languages l ON t.languageId = l.id
      WHERE l.code = ? AND tk.key_path = ? AND t.isActive = true AND tk.isActive = true
      LIMIT 1`, [languageCode, keyPath]);
        return rows[0]?.value || null;
    }
    async save(translation) {
        const result = await this.db.execute(`INSERT INTO translations (value, notes, isActive, languageId, keyId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`, [
            translation.value,
            translation.notes,
            translation.isActive,
            translation.languageId,
            translation.keyId,
        ]);
        const savedTranslation = await this.findById(result.insertId);
        return savedTranslation;
    }
    async update(id, translation) {
        const fields = [];
        const values = [];
        if (translation.value !== undefined) {
            fields.push("value = ?");
            values.push(translation.value);
        }
        if (translation.notes !== undefined) {
            fields.push("notes = ?");
            values.push(translation.notes);
        }
        if (translation.isActive !== undefined) {
            fields.push("isActive = ?");
            values.push(translation.isActive);
        }
        fields.push("updatedAt = NOW()");
        values.push(id);
        await this.db.execute(`UPDATE translations SET ${fields.join(", ")} WHERE id = ?`, values);
        const updatedTranslation = await this.findById(id);
        return updatedTranslation;
    }
    async delete(id) {
        await this.db.execute("DELETE FROM translations WHERE id = ?", [id]);
    }
    async bulkSave(translations) {
        if (translations.length === 0)
            return [];
        const values = translations
            .map((t) => `(?, ?, ?, ?, ?, NOW(), NOW())`)
            .join(", ");
        const params = translations.flatMap((t) => [
            t.value,
            t.notes,
            t.isActive,
            t.languageId,
            t.keyId,
        ]);
        await this.db.execute(`INSERT INTO translations (value, notes, isActive, languageId, keyId, createdAt, updatedAt) 
       VALUES ${values}`, params);
        return translations;
    }
    async findById(id) {
        const [rows] = await this.db.execute("SELECT * FROM translations WHERE id = ?", [id]);
        return rows[0] || null;
    }
};
exports.MysqlTranslationRepository = MysqlTranslationRepository;
exports.MysqlTranslationRepository = MysqlTranslationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlTranslationRepository);
let MysqlTranslationKeyRepository = class MysqlTranslationKeyRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const [rows] = await this.db.execute("SELECT * FROM translation_keys ORDER BY namespaceId, key_path");
        return rows;
    }
    async findByNamespace(namespaceId) {
        const [rows] = await this.db.execute("SELECT * FROM translation_keys WHERE namespaceId = ? AND isActive = true ORDER BY key_path", [namespaceId]);
        return rows;
    }
    async findByKeyPath(keyPath) {
        const [rows] = await this.db.execute("SELECT * FROM translation_keys WHERE key_path = ?", [keyPath]);
        return rows[0] || null;
    }
    async save(key) {
        const result = await this.db.execute(`INSERT INTO translation_keys (key_path, description, isActive, namespaceId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`, [key.keyPath, key.description, key.isActive, key.namespaceId]);
        const savedKey = await this.findById(result.insertId);
        return savedKey;
    }
    async update(id, key) {
        const fields = [];
        const values = [];
        if (key.keyPath !== undefined) {
            fields.push("key_path = ?");
            values.push(key.keyPath);
        }
        if (key.description !== undefined) {
            fields.push("description = ?");
            values.push(key.description);
        }
        if (key.isActive !== undefined) {
            fields.push("isActive = ?");
            values.push(key.isActive);
        }
        fields.push("updatedAt = NOW()");
        values.push(id);
        await this.db.execute(`UPDATE translation_keys SET ${fields.join(", ")} WHERE id = ?`, values);
        const updatedKey = await this.findById(id);
        return updatedKey;
    }
    async delete(id) {
        await this.db.execute("DELETE FROM translation_keys WHERE id = ?", [id]);
    }
    async bulkSave(keys) {
        if (keys.length === 0)
            return [];
        const values = keys.map((k) => `(?, ?, ?, ?, NOW(), NOW())`).join(", ");
        const params = keys.flatMap((k) => [
            k.keyPath,
            k.description,
            k.isActive,
            k.namespaceId,
        ]);
        await this.db.execute(`INSERT INTO translation_keys (key_path, description, isActive, namespaceId, createdAt, updatedAt) 
       VALUES ${values}`, params);
        return keys;
    }
    async findById(id) {
        const [rows] = await this.db.execute("SELECT * FROM translation_keys WHERE id = ?", [id]);
        return rows[0] || null;
    }
};
exports.MysqlTranslationKeyRepository = MysqlTranslationKeyRepository;
exports.MysqlTranslationKeyRepository = MysqlTranslationKeyRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlTranslationKeyRepository);
let MysqlTranslationNamespaceRepository = class MysqlTranslationNamespaceRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const [rows] = await this.db.execute("SELECT * FROM translation_namespaces WHERE isActive = true ORDER BY name");
        return rows;
    }
    async findById(id) {
        const [rows] = await this.db.execute("SELECT * FROM translation_namespaces WHERE id = ?", [id]);
        return rows[0] || null;
    }
    async findByName(name) {
        const [rows] = await this.db.execute("SELECT * FROM translation_namespaces WHERE name = ?", [name]);
        return rows[0] || null;
    }
    async save(namespace) {
        const result = await this.db.execute(`INSERT INTO translation_namespaces (name, description, isActive, createdAt, updatedAt) 
       VALUES (?, ?, ?, NOW(), NOW())`, [namespace.name, namespace.description, namespace.isActive]);
        const savedNamespace = await this.findById(result.insertId);
        return savedNamespace;
    }
    async update(id, namespace) {
        const fields = [];
        const values = [];
        if (namespace.name !== undefined) {
            fields.push("name = ?");
            values.push(namespace.name);
        }
        if (namespace.description !== undefined) {
            fields.push("description = ?");
            values.push(namespace.description);
        }
        if (namespace.isActive !== undefined) {
            fields.push("isActive = ?");
            values.push(namespace.isActive);
        }
        fields.push("updatedAt = NOW()");
        values.push(id);
        await this.db.execute(`UPDATE translation_namespaces SET ${fields.join(", ")} WHERE id = ?`, values);
        const updatedNamespace = await this.findById(id);
        return updatedNamespace;
    }
    async delete(id) {
        await this.db.execute("DELETE FROM translation_namespaces WHERE id = ?", [
            id,
        ]);
    }
};
exports.MysqlTranslationNamespaceRepository = MysqlTranslationNamespaceRepository;
exports.MysqlTranslationNamespaceRepository = MysqlTranslationNamespaceRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], MysqlTranslationNamespaceRepository);
//# sourceMappingURL=mysql-translation.repository.js.map