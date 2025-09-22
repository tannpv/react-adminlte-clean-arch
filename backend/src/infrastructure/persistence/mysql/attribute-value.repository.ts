import { Injectable } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { AttributeValue } from "../../../domain/entities/attribute-value.entity";
import { AttributeValueRepository } from "../../../domain/repositories/attribute-value.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlAttributeValueRepository implements AttributeValueRepository {
  constructor(private readonly database: MysqlDatabaseService) {}

  async findAll(): Promise<AttributeValue[]> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_values ORDER BY attribute_id, sort_order ASC"
    );
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findById(id: number): Promise<AttributeValue | null> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_values WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
  }

  async findByAttributeId(attributeId: number): Promise<AttributeValue[]> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_values WHERE attribute_id = ? ORDER BY sort_order ASC",
      [attributeId]
    );
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findByAttributeIdAndValueCode(
    attributeId: number,
    valueCode: string
  ): Promise<AttributeValue | null> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_values WHERE attribute_id = ? AND value_code = ?",
      [attributeId, valueCode]
    );
    return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
  }

  async create(attributeValue: AttributeValue): Promise<AttributeValue> {
    const [result] = await this.database.execute<ResultSetHeader>(
      `INSERT INTO attribute_values (attribute_id, value_code, label, sort_order) 
       VALUES (?, ?, ?, ?)`,
      [
        attributeValue.attributeId,
        attributeValue.valueCode,
        attributeValue.label,
        attributeValue.sortOrder,
      ]
    );
    return new AttributeValue(
      result.insertId,
      attributeValue.attributeId,
      attributeValue.valueCode,
      attributeValue.label,
      attributeValue.sortOrder
    );
  }

  async update(attributeValue: AttributeValue): Promise<AttributeValue> {
    await this.database.execute(
      `UPDATE attribute_values SET value_code = ?, label = ?, sort_order = ? 
       WHERE id = ?`,
      [
        attributeValue.valueCode,
        attributeValue.label,
        attributeValue.sortOrder,
        attributeValue.id,
      ]
    );
    return attributeValue;
  }

  async delete(id: number): Promise<void> {
    await this.database.execute("DELETE FROM attribute_values WHERE id = ?", [
      id,
    ]);
  }

  async deleteByAttributeId(attributeId: number): Promise<void> {
    await this.database.execute(
      "DELETE FROM attribute_values WHERE attribute_id = ?",
      [attributeId]
    );
  }

  async existsByAttributeIdAndValueCode(
    attributeId: number,
    valueCode: string,
    excludeId?: number
  ): Promise<boolean> {
    let query =
      "SELECT COUNT(*) as count FROM attribute_values WHERE attribute_id = ? AND value_code = ?";
    const params: any[] = [attributeId, valueCode];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await this.database.execute<RowDataPacket[]>(query, params);
    return Number(rows[0].count) > 0;
  }

  private mapRowToEntity(row: RowDataPacket): AttributeValue {
    return new AttributeValue(
      row.id,
      row.attribute_id,
      row.value_code,
      row.label,
      row.sort_order
    );
  }
}
