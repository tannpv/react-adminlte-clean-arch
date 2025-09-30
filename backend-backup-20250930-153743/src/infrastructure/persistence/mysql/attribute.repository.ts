import { Injectable } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Attribute } from "../../../domain/entities/attribute.entity";
import { AttributeRepository } from "../../../domain/repositories/attribute.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlAttributeRepository implements AttributeRepository {
  constructor(private readonly database: MysqlDatabaseService) {}

  async findAll(): Promise<Attribute[]> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attributes ORDER BY name ASC"
    );
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findById(id: number): Promise<Attribute | null> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attributes WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
  }

  async findByCode(code: string): Promise<Attribute | null> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attributes WHERE code = ?",
      [code]
    );
    return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
  }

  async create(attribute: Attribute): Promise<Attribute> {
    const [result] = await this.database.execute<ResultSetHeader>(
      `INSERT INTO attributes (code, name, input_type, data_type, unit, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        attribute.code,
        attribute.name,
        attribute.inputType,
        attribute.dataType,
        attribute.unit,
        attribute.createdAt,
        attribute.updatedAt,
      ]
    );
    return new Attribute(
      result.insertId,
      attribute.code,
      attribute.name,
      attribute.inputType,
      attribute.dataType,
      attribute.unit,
      attribute.createdAt,
      attribute.updatedAt
    );
  }

  async update(attribute: Attribute): Promise<Attribute> {
    await this.database.execute(
      `UPDATE attributes SET code = ?, name = ?, input_type = ?, data_type = ?, unit = ?, updated_at = ? 
       WHERE id = ?`,
      [
        attribute.code,
        attribute.name,
        attribute.inputType,
        attribute.dataType,
        attribute.unit,
        attribute.updatedAt,
        attribute.id,
      ]
    );
    return attribute;
  }

  async delete(id: number): Promise<void> {
    await this.database.execute("DELETE FROM attributes WHERE id = ?", [id]);
  }

  async existsByCode(code: string, excludeId?: number): Promise<boolean> {
    let query = "SELECT COUNT(*) as count FROM attributes WHERE code = ?";
    const params: any[] = [code];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await this.database.execute<RowDataPacket[]>(query, params);
    return Number(rows[0].count) > 0;
  }

  private mapRowToEntity(row: RowDataPacket): Attribute {
    return new Attribute(
      row.id,
      row.code,
      row.name,
      row.input_type,
      row.data_type,
      row.unit,
      row.created_at,
      row.updated_at
    );
  }
}
