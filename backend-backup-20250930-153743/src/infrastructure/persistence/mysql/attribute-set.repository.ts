import { Injectable } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { AttributeSet } from "../../../domain/entities/attribute-set.entity";
import { AttributeSetRepository } from "../../../domain/repositories/attribute-set.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlAttributeSetRepository implements AttributeSetRepository {
  constructor(private readonly database: MysqlDatabaseService) {}

  async findAll(): Promise<AttributeSet[]> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_sets ORDER BY sort_order ASC, name ASC"
    );
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findById(id: number): Promise<AttributeSet | null> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_sets WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
  }

  async findByName(name: string): Promise<AttributeSet | null> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_sets WHERE name = ?",
      [name]
    );
    return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
  }

  async create(attributeSet: AttributeSet): Promise<AttributeSet> {
    const [result] = await this.database.execute<ResultSetHeader>(
      `INSERT INTO attribute_sets (name, description, is_system, sort_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        attributeSet.name,
        attributeSet.description,
        attributeSet.isSystem,
        attributeSet.sortOrder,
        attributeSet.createdAt,
        attributeSet.updatedAt,
      ]
    );
    return new AttributeSet(
      result.insertId,
      attributeSet.name,
      attributeSet.description,
      attributeSet.isSystem,
      attributeSet.sortOrder,
      attributeSet.createdAt,
      attributeSet.updatedAt,
      attributeSet.attributes
    );
  }

  async update(attributeSet: AttributeSet): Promise<AttributeSet> {
    await this.database.execute(
      `UPDATE attribute_sets SET name = ?, description = ?, is_system = ?, sort_order = ?, updated_at = ? 
       WHERE id = ?`,
      [
        attributeSet.name,
        attributeSet.description,
        attributeSet.isSystem,
        attributeSet.sortOrder,
        attributeSet.updatedAt,
        attributeSet.id,
      ]
    );
    return attributeSet;
  }

  async delete(id: number): Promise<void> {
    await this.database.execute("DELETE FROM attribute_sets WHERE id = ?", [
      id,
    ]);
  }

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    let query = "SELECT COUNT(*) as count FROM attribute_sets WHERE name = ?";
    const params: any[] = [name];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await this.database.execute<RowDataPacket[]>(query, params);
    return Number(rows[0].count) > 0;
  }

  private mapRowToEntity(row: RowDataPacket): AttributeSet {
    return new AttributeSet(
      row.id,
      row.name,
      row.description,
      row.is_system,
      row.sort_order,
      row.created_at,
      row.updated_at,
      [] // Attributes will be loaded separately
    );
  }
}
