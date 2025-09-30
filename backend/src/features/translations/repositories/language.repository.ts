import { Injectable } from "@nestjs/common";
import { MysqlDatabaseService } from "../../../infrastructure/persistence/mysql/mysql-database.service";
import { Language } from "../entities/language.entity";

@Injectable()
export class LanguageRepository {
  constructor(private readonly databaseService: MysqlDatabaseService) {}

  async findAll(): Promise<Language[]> {
    const query = `
      SELECT * FROM languages 
      WHERE is_active = 1 
      ORDER BY is_default DESC, name ASC
    `;
    const [rows] = await this.databaseService.execute(query);
    return rows.map(this.mapRowToLanguage);
  }

  async findByCode(code: string): Promise<Language | null> {
    const query = `
      SELECT * FROM languages 
      WHERE code = ? AND is_active = 1
    `;
    const [rows] = await this.databaseService.execute(query, [code.toLowerCase()]);
    return rows.length > 0 ? this.mapRowToLanguage(rows[0]) : null;
  }

  async findDefault(): Promise<Language | null> {
    const query = `
      SELECT * FROM languages 
      WHERE is_default = 1 AND is_active = 1
    `;
    const [rows] = await this.databaseService.execute(query);
    return rows.length > 0 ? this.mapRowToLanguage(rows[0]) : null;
  }

  async create(languageData: Partial<Language>): Promise<Language> {
    const query = `
      INSERT INTO languages (code, name, native_name, is_default, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await this.databaseService.execute(query, [
      languageData.code,
      languageData.name,
      languageData.nativeName || null,
      languageData.isDefault ? 1 : 0,
      languageData.isActive !== false ? 1 : 0,
    ]);
    
    return this.findById((result as any).insertId);
  }

  async update(id: number, languageData: Partial<Language>): Promise<Language> {
    const fields = [];
    const values = [];
    
    if (languageData.code !== undefined) {
      fields.push('code = ?');
      values.push(languageData.code);
    }
    if (languageData.name !== undefined) {
      fields.push('name = ?');
      values.push(languageData.name);
    }
    if (languageData.nativeName !== undefined) {
      fields.push('native_name = ?');
      values.push(languageData.nativeName);
    }
    if (languageData.isDefault !== undefined) {
      fields.push('is_default = ?');
      values.push(languageData.isDefault ? 1 : 0);
    }
    if (languageData.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(languageData.isActive ? 1 : 0);
    }
    
    fields.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE languages SET ${fields.join(', ')} WHERE id = ?`;
    await this.databaseService.execute(query, values);
    
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const query = `DELETE FROM languages WHERE id = ?`;
    await this.databaseService.execute(query, [id]);
  }

  async setDefault(id: number): Promise<void> {
    // Remove default from all languages
    await this.databaseService.execute('UPDATE languages SET is_default = 0');
    
    // Set new default
    await this.databaseService.execute('UPDATE languages SET is_default = 1 WHERE id = ?', [id]);
  }

  private async findById(id: number): Promise<Language> {
    const query = `SELECT * FROM languages WHERE id = ?`;
    const [rows] = await this.databaseService.execute(query, [id]);
    return this.mapRowToLanguage(rows[0]);
  }

  private mapRowToLanguage(row: any): Language {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      nativeName: row.native_name,
      isDefault: Boolean(row.is_default),
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}