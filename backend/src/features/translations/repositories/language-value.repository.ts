import { Injectable } from "@nestjs/common";
import { MysqlDatabaseService } from "../../../infrastructure/persistence/mysql/mysql-database.service";
import { LanguageValue } from "../entities/language-value.entity";

@Injectable()
export class LanguageValueRepository {
  constructor(private readonly databaseService: MysqlDatabaseService) {}

  async findByLanguageAndKey(
    languageCode: string,
    keyHash: string
  ): Promise<LanguageValue | null> {
    const query = `
      SELECT * FROM language_values 
      WHERE language_code = ? AND key_hash = ?
    `;
    const [rows] = await this.databaseService.execute(query, [
      languageCode.toLowerCase(),
      keyHash,
    ]);
    return rows.length > 0 ? this.mapRowToLanguageValue(rows[0]) : null;
  }

  async findByLanguageAndOriginalKey(
    languageCode: string,
    originalKey: string
  ): Promise<LanguageValue | null> {
    const query = `
      SELECT * FROM language_values 
      WHERE language_code = ? AND original_key = ?
    `;
    const [rows] = await this.databaseService.execute(query, [
      languageCode.toLowerCase(),
      originalKey.trim(),
    ]);
    return rows.length > 0 ? this.mapRowToLanguageValue(rows[0]) : null;
  }

  async findAllByLanguage(languageCode: string): Promise<LanguageValue[]> {
    const query = `
      SELECT * FROM language_values 
      WHERE language_code = ? 
      ORDER BY original_key ASC
    `;
    const [rows] = await this.databaseService.execute(query, [
      languageCode.toLowerCase(),
    ]);
    return rows.map(this.mapRowToLanguageValue);
  }

  async create(
    languageValueData: Partial<LanguageValue>
  ): Promise<LanguageValue> {
    const query = `
      INSERT INTO language_values (key_hash, language_code, original_key, destination_value, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await this.databaseService.execute(query, [
      languageValueData.keyHash,
      languageValueData.languageCode,
      languageValueData.originalKey,
      languageValueData.destinationValue,
    ]);

    return this.findById((result as any).insertId);
  }

  async update(
    id: number,
    languageValueData: Partial<LanguageValue>
  ): Promise<LanguageValue> {
    const fields = [];
    const values = [];

    if (languageValueData.keyHash !== undefined) {
      fields.push("key_hash = ?");
      values.push(languageValueData.keyHash);
    }
    if (languageValueData.languageCode !== undefined) {
      fields.push("language_code = ?");
      values.push(languageValueData.languageCode);
    }
    if (languageValueData.originalKey !== undefined) {
      fields.push("original_key = ?");
      values.push(languageValueData.originalKey);
    }
    if (languageValueData.destinationValue !== undefined) {
      fields.push("destination_value = ?");
      values.push(languageValueData.destinationValue);
    }

    fields.push("updated_at = NOW()");
    values.push(id);

    const query = `UPDATE language_values SET ${fields.join(
      ", "
    )} WHERE id = ?`;
    await this.databaseService.execute(query, values);

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const query = `DELETE FROM language_values WHERE id = ?`;
    await this.databaseService.execute(query, [id]);
  }

  async deleteByLanguageAndKey(
    languageCode: string,
    keyHash: string
  ): Promise<void> {
    const query = `
      DELETE FROM language_values 
      WHERE language_code = ? AND key_hash = ?
    `;
    await this.databaseService.execute(query, [
      languageCode.toLowerCase(),
      keyHash,
    ]);
  }

  async findMissingTranslations(
    languageCode: string
  ): Promise<LanguageValue[]> {
    // Find translations that exist in other languages but not in the specified language
    const query = `
      SELECT DISTINCT lv1.key_hash, lv1.original_key
      FROM language_values lv1
      WHERE lv1.language_code != ?
      AND NOT EXISTS (
        SELECT 1 FROM language_values lv2 
        WHERE lv2.language_code = ? 
        AND lv2.key_hash = lv1.key_hash
      )
    `;
    const [rows] = await this.databaseService.execute(query, [
      languageCode.toLowerCase(),
      languageCode.toLowerCase(),
    ]);
    return rows.map(
      (row: any) =>
        ({
          keyHash: row.key_hash,
          originalKey: row.original_key,
        } as any)
    );
  }

  private async findById(id: number): Promise<LanguageValue> {
    const query = `SELECT * FROM language_values WHERE id = ?`;
    const [rows] = await this.databaseService.execute(query, [id]);
    return this.mapRowToLanguageValue(rows[0]);
  }

  private mapRowToLanguageValue(row: any): LanguageValue {
    return {
      id: row.id,
      keyHash: row.key_hash,
      languageCode: row.language_code,
      originalKey: row.original_key,
      destinationValue: row.destination_value,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
