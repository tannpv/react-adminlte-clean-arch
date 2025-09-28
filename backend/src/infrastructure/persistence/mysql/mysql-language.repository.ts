import { Injectable } from "@nestjs/common";
import { RowDataPacket } from "mysql2";
import { Language } from "../../../domain/entities/language.entity";
import { LanguageRepository } from "../../../domain/repositories/language.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlLanguageRepository implements LanguageRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(): Promise<Language[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM languages ORDER BY isDefault DESC, name ASC"
    );
    return rows as Language[];
  }

  async findById(id: number): Promise<Language | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM languages WHERE id = ?",
      [id]
    );
    return (rows[0] as Language) || null;
  }

  async findByCode(code: string): Promise<Language | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM languages WHERE code = ?",
      [code]
    );
    return (rows[0] as Language) || null;
  }

  async findActive(): Promise<Language[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM languages WHERE isActive = true ORDER BY isDefault DESC, name ASC"
    );
    return rows as Language[];
  }

  async findDefault(): Promise<Language | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT * FROM languages WHERE isDefault = true AND isActive = true LIMIT 1"
    );
    return (rows[0] as Language) || null;
  }

  async save(language: Language): Promise<Language> {
    const result = await this.db.execute(
      `INSERT INTO languages (code, name, nativeName, isDefault, isActive, flagIcon, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        language.code,
        language.name,
        language.nativeName,
        language.isDefault,
        language.isActive,
        language.flagIcon,
      ]
    );

    const savedLanguage = await this.findById((result as any).insertId);
    return savedLanguage!;
  }

  async update(id: number, language: Partial<Language>): Promise<Language> {
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

    await this.db.execute(
      `UPDATE languages SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedLanguage = await this.findById(id);
    return updatedLanguage!;
  }

  async delete(id: number): Promise<void> {
    await this.db.execute("DELETE FROM languages WHERE id = ?", [id]);
  }
}
