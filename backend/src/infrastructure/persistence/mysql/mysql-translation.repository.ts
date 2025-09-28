import { Injectable } from "@nestjs/common";
import { RowDataPacket } from "mysql2";
import { TranslationKey } from "../../../domain/entities/translation-key.entity";
import { TranslationNamespace } from "../../../domain/entities/translation-namespace.entity";
import { Translation } from "../../../domain/entities/translation.entity";
import {
  TranslationKeyRepository,
  TranslationNamespaceRepository,
  TranslationRepository,
} from "../../../domain/repositories/translation.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlTranslationRepository implements TranslationRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findByLanguageAndNamespace(
    languageCode: string,
    namespace: string
  ): Promise<Record<string, string>> {
    // Optimized query with proper indexes
    const [rows] = await this.db.execute<any[]>(
      `SELECT 
        tk.key_path,
        t.value
      FROM translations t
      INNER JOIN translation_keys tk ON t.keyId = tk.id
      INNER JOIN languages l ON t.languageId = l.id
      INNER JOIN translation_namespaces tn ON tk.namespaceId = tn.id
      WHERE l.code = ? AND tn.name = ? AND t.isActive = true AND tk.isActive = true
      ORDER BY tk.key_path`,
      [languageCode, namespace]
    );

    const translations: Record<string, string> = {};
    rows.forEach((row) => {
      translations[row.key_path] = row.value;
    });

    return translations;
  }

  async findByLanguageAndKeyPath(
    languageCode: string,
    keyPath: string
  ): Promise<string | null> {
    const [rows] = await this.db.execute<any[]>(
      `SELECT t.value
      FROM translations t
      INNER JOIN translation_keys tk ON t.keyId = tk.id
      INNER JOIN languages l ON t.languageId = l.id
      WHERE l.code = ? AND tk.key_path = ? AND t.isActive = true AND tk.isActive = true
      LIMIT 1`,
      [languageCode, keyPath]
    );

    return rows[0]?.value || null;
  }

  async save(translation: Translation): Promise<Translation> {
    const result = await this.db.execute(
      `INSERT INTO translations (value, notes, isActive, languageId, keyId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        translation.value,
        translation.notes,
        translation.isActive,
        translation.languageId,
        translation.keyId,
      ]
    );

    const savedTranslation = await this.findById((result as any).insertId);
    return savedTranslation!;
  }

  async update(
    id: number,
    translation: Partial<Translation>
  ): Promise<Translation> {
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

    await this.db.execute(
      `UPDATE translations SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedTranslation = await this.findById(id);
    return updatedTranslation!;
  }

  async delete(id: number): Promise<void> {
    await this.db.execute("DELETE FROM translations WHERE id = ?", [id]);
  }

  async bulkSave(translations: Translation[]): Promise<Translation[]> {
    if (translations.length === 0) return [];

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

    await this.db.execute(
      `INSERT INTO translations (value, notes, isActive, languageId, keyId, createdAt, updatedAt) 
       VALUES ${values}`,
      params
    );

    // Return the saved translations (simplified for bulk operation)
    return translations;
  }

  async findById(id: number): Promise<Translation | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM translations WHERE id = ?",
      [id]
    );
    return (rows[0] as Translation) || null;
  }

  async findByKeyId(keyId: number): Promise<Translation[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM translations WHERE keyId = ?",
      [keyId]
    );
    return rows as Translation[];
  }
}

@Injectable()
export class MysqlTranslationKeyRepository implements TranslationKeyRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(): Promise<TranslationKey[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM translation_keys ORDER BY namespaceId, key_path"
    );
    return rows as TranslationKey[];
  }

  async findByNamespace(namespaceId: number): Promise<TranslationKey[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM translation_keys WHERE namespaceId = ? AND isActive = true ORDER BY key_path",
      [namespaceId]
    );
    return rows as TranslationKey[];
  }

  async findByKeyPath(keyPath: string): Promise<TranslationKey | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM translation_keys WHERE key_path = ?",
      [keyPath]
    );
    return (rows[0] as TranslationKey) || null;
  }

  async save(key: TranslationKey): Promise<TranslationKey> {
    const result = await this.db.execute(
      `INSERT INTO translation_keys (key_path, description, isActive, namespaceId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [key.keyPath, key.description, key.isActive, key.namespaceId]
    );

    const savedKey = await this.findById((result as any).insertId);
    return savedKey!;
  }

  async update(
    id: number,
    key: Partial<TranslationKey>
  ): Promise<TranslationKey> {
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

    await this.db.execute(
      `UPDATE translation_keys SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedKey = await this.findById(id);
    return updatedKey!;
  }

  async delete(id: number): Promise<void> {
    await this.db.execute("DELETE FROM translation_keys WHERE id = ?", [id]);
  }

  async bulkSave(keys: TranslationKey[]): Promise<TranslationKey[]> {
    if (keys.length === 0) return [];

    const values = keys.map((k) => `(?, ?, ?, ?, NOW(), NOW())`).join(", ");

    const params = keys.flatMap((k) => [
      k.keyPath,
      k.description,
      k.isActive,
      k.namespaceId,
    ]);

    await this.db.execute(
      `INSERT INTO translation_keys (key_path, description, isActive, namespaceId, createdAt, updatedAt) 
       VALUES ${values}`,
      params
    );

    return keys;
  }

  private async findById(id: number): Promise<TranslationKey | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM translation_keys WHERE id = ?",
      [id]
    );
    return (rows[0] as TranslationKey) || null;
  }
}

@Injectable()
export class MysqlTranslationNamespaceRepository
  implements TranslationNamespaceRepository
{
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(): Promise<TranslationNamespace[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM translation_namespaces WHERE isActive = true ORDER BY name"
    );
    return rows as TranslationNamespace[];
  }

  async findById(id: number): Promise<TranslationNamespace | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM translation_namespaces WHERE id = ?",
      [id]
    );
    return (rows[0] as TranslationNamespace) || null;
  }

  async findByName(name: string): Promise<TranslationNamespace | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM translation_namespaces WHERE name = ?",
      [name]
    );
    return (rows[0] as TranslationNamespace) || null;
  }

  async save(namespace: TranslationNamespace): Promise<TranslationNamespace> {
    const result = await this.db.execute(
      `INSERT INTO translation_namespaces (name, description, isActive, createdAt, updatedAt) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [namespace.name, namespace.description, namespace.isActive]
    );

    const savedNamespace = await this.findById((result as any).insertId);
    return savedNamespace!;
  }

  async update(
    id: number,
    namespace: Partial<TranslationNamespace>
  ): Promise<TranslationNamespace> {
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

    await this.db.execute(
      `UPDATE translation_namespaces SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedNamespace = await this.findById(id);
    return updatedNamespace!;
  }

  async delete(id: number): Promise<void> {
    await this.db.execute("DELETE FROM translation_namespaces WHERE id = ?", [
      id,
    ]);
  }
}
