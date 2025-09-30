import { Injectable } from "@nestjs/common";
import {
  Commission,
  CommissionProps,
} from "../../../domain/entities/commission.entity";
import { CommissionRepository } from "../../../domain/repositories/commission.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlCommissionRepository implements CommissionRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<Commission | null> {
    const [rows] = await this.db.execute(
      `SELECT * FROM commissions WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return this.mapRowToCommission(row);
  }

  async findByStoreId(
    storeId: number,
    limit?: number,
    offset?: number
  ): Promise<Commission[]> {
    let query = `SELECT * FROM commissions WHERE store_id = ? ORDER BY created_at DESC`;
    const params: any[] = [storeId];

    if (limit !== undefined) {
      query += ` LIMIT ?`;
      params.push(limit);

      if (offset !== undefined) {
        query += ` OFFSET ?`;
        params.push(offset);
      }
    }

    const [rows] = await this.db.execute(query, params);

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => this.mapRowToCommission(row));
  }

  async findByOrderItemId(orderItemId: number): Promise<Commission | null> {
    const [rows] = await this.db.execute(
      `SELECT * FROM commissions WHERE order_item_id = ?`,
      [orderItemId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return this.mapRowToCommission(row);
  }

  async findByStatus(
    status: string,
    limit?: number,
    offset?: number
  ): Promise<Commission[]> {
    let query = `SELECT * FROM commissions WHERE status = ? ORDER BY created_at DESC`;
    const params: any[] = [status];

    if (limit !== undefined) {
      query += ` LIMIT ?`;
      params.push(limit);

      if (offset !== undefined) {
        query += ` OFFSET ?`;
        params.push(offset);
      }
    }

    const [rows] = await this.db.execute(query, params);

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => this.mapRowToCommission(row));
  }

  async findAll(limit?: number, offset?: number): Promise<Commission[]> {
    let query = `SELECT * FROM commissions ORDER BY created_at DESC`;
    const params: any[] = [];

    if (limit !== undefined) {
      query += ` LIMIT ?`;
      params.push(limit);

      if (offset !== undefined) {
        query += ` OFFSET ?`;
        params.push(offset);
      }
    }

    const [rows] = await this.db.execute(query, params);

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => this.mapRowToCommission(row));
  }

  async create(
    commission: Omit<Commission, "id" | "createdAt" | "updatedAt">
  ): Promise<Commission> {
    const [result] = await this.db.execute(
      `INSERT INTO commissions (order_item_id, store_id, commission_rate, commission_amount, status, paid_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        commission.orderItemId,
        commission.storeId,
        commission.commissionRate,
        commission.commissionAmount,
        commission.status,
        commission.paidAt,
      ]
    );

    const insertResult = result as any;
    const newId = insertResult.insertId;

    const createdCommission = await this.findById(newId);
    if (!createdCommission) {
      throw new Error("Failed to create commission");
    }

    return createdCommission;
  }

  async update(
    id: number,
    commission: Partial<Commission>
  ): Promise<Commission | null> {
    const existingCommission = await this.findById(id);
    if (!existingCommission) {
      return null;
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (commission.commissionRate !== undefined) {
      updateFields.push("commission_rate = ?");
      updateValues.push(commission.commissionRate);
    }
    if (commission.commissionAmount !== undefined) {
      updateFields.push("commission_amount = ?");
      updateValues.push(commission.commissionAmount);
    }
    if (commission.status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(commission.status);
    }
    if (commission.paidAt !== undefined) {
      updateFields.push("paid_at = ?");
      updateValues.push(commission.paidAt);
    }

    if (updateFields.length === 0) {
      return existingCommission;
    }

    updateFields.push("updated_at = NOW()");
    updateValues.push(id);

    await this.db.execute(
      `UPDATE commissions SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.db.execute(
      `DELETE FROM commissions WHERE id = ?`,
      [id]
    );
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }

  async count(): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM commissions`
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async countByStoreId(storeId: number): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM commissions WHERE store_id = ?`,
      [storeId]
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async countByStatus(status: string): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM commissions WHERE status = ?`,
      [status]
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async getTotalCommissionByStoreId(storeId: number): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT SUM(commission_amount) as total FROM commissions WHERE store_id = ? AND status = 'paid'`,
      [storeId]
    );
    const result = rows as any[];
    return Number(result[0]?.total ?? 0);
  }

  async getPendingCommissionByStoreId(storeId: number): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT SUM(commission_amount) as total FROM commissions WHERE store_id = ? AND status = 'pending'`,
      [storeId]
    );
    const result = rows as any[];
    return Number(result[0]?.total ?? 0);
  }

  private mapRowToCommission(row: any): Commission {
    const props: CommissionProps = {
      id: row.id,
      orderItemId: row.order_item_id,
      storeId: row.store_id,
      commissionRate: Number(row.commission_rate),
      commissionAmount: Number(row.commission_amount),
      status: row.status,
      paidAt: row.paid_at ? new Date(row.paid_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Commission(props);
  }
}
