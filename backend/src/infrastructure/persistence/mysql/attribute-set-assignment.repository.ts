import { Injectable } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { AttributeSetAssignment } from "../../../domain/entities/attribute-set-assignment.entity";
import { AttributeSetAssignmentRepository } from "../../../domain/repositories/attribute-set-assignment.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlAttributeSetAssignmentRepository
  implements AttributeSetAssignmentRepository
{
  constructor(private readonly database: MysqlDatabaseService) {}

  async findAll(): Promise<AttributeSetAssignment[]> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_set_assignments ORDER BY attribute_set_id, sort_order ASC"
    );
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findById(id: number): Promise<AttributeSetAssignment | null> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_set_assignments WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
  }

  async findByAttributeSetId(
    attributeSetId: number
  ): Promise<AttributeSetAssignment[]> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_set_assignments WHERE attribute_set_id = ? ORDER BY sort_order ASC",
      [attributeSetId]
    );
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findByAttributeId(
    attributeId: number
  ): Promise<AttributeSetAssignment[]> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_set_assignments WHERE attribute_id = ? ORDER BY sort_order ASC",
      [attributeId]
    );
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findByAttributeSetIdAndAttributeId(
    attributeSetId: number,
    attributeId: number
  ): Promise<AttributeSetAssignment | null> {
    const [rows] = await this.database.execute<RowDataPacket[]>(
      "SELECT * FROM attribute_set_assignments WHERE attribute_set_id = ? AND attribute_id = ?",
      [attributeSetId, attributeId]
    );
    return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
  }

  async create(
    assignment: AttributeSetAssignment
  ): Promise<AttributeSetAssignment> {
    const [result] = await this.database.execute<ResultSetHeader>(
      `INSERT INTO attribute_set_assignments (attribute_set_id, attribute_id, sort_order, is_required, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        assignment.attributeSetId,
        assignment.attributeId,
        assignment.sortOrder,
        assignment.isRequired,
        assignment.createdAt,
        assignment.updatedAt,
      ]
    );
    return new AttributeSetAssignment(
      result.insertId,
      assignment.attributeSetId,
      assignment.attributeId,
      assignment.sortOrder,
      assignment.isRequired,
      assignment.createdAt,
      assignment.updatedAt
    );
  }

  async update(
    assignment: AttributeSetAssignment
  ): Promise<AttributeSetAssignment> {
    await this.database.execute(
      `UPDATE attribute_set_assignments SET sort_order = ?, is_required = ?, updated_at = ? 
       WHERE id = ?`,
      [
        assignment.sortOrder,
        assignment.isRequired,
        assignment.updatedAt,
        assignment.id,
      ]
    );
    return assignment;
  }

  async delete(id: number): Promise<void> {
    await this.database.execute(
      "DELETE FROM attribute_set_assignments WHERE id = ?",
      [id]
    );
  }

  async deleteByAttributeSetId(attributeSetId: number): Promise<void> {
    await this.database.execute(
      "DELETE FROM attribute_set_assignments WHERE attribute_set_id = ?",
      [attributeSetId]
    );
  }

  async deleteByAttributeId(attributeId: number): Promise<void> {
    await this.database.execute(
      "DELETE FROM attribute_set_assignments WHERE attribute_id = ?",
      [attributeId]
    );
  }

  async existsByAttributeSetIdAndAttributeId(
    attributeSetId: number,
    attributeId: number,
    excludeId?: number
  ): Promise<boolean> {
    let query =
      "SELECT COUNT(*) as count FROM attribute_set_assignments WHERE attribute_set_id = ? AND attribute_id = ?";
    const params: any[] = [attributeSetId, attributeId];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await this.database.execute<RowDataPacket[]>(query, params);
    return Number(rows[0].count) > 0;
  }

  private mapRowToEntity(row: RowDataPacket): AttributeSetAssignment {
    return new AttributeSetAssignment(
      row.id,
      row.attribute_set_id,
      row.attribute_id,
      row.sort_order,
      row.is_required,
      row.created_at,
      row.updated_at
    );
  }
}
