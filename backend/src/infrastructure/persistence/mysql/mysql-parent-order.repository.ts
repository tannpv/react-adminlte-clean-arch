import { Injectable } from "@nestjs/common";
import {
  ParentOrder,
  ParentOrderProps,
} from "../../../domain/entities/parent-order.entity";
import { ParentOrderRepository } from "../../../domain/repositories/parent-order.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlParentOrderRepository implements ParentOrderRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<ParentOrder | null> {
    const [rows] = await this.db.execute(
      `SELECT * FROM parent_orders WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return this.mapRowToParentOrder(row);
  }

  async findByOrderNumber(orderNumber: string): Promise<ParentOrder | null> {
    const [rows] = await this.db.execute(
      `SELECT * FROM parent_orders WHERE order_number = ?`,
      [orderNumber]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return this.mapRowToParentOrder(row);
  }

  async findByCustomerId(
    customerId: number,
    limit?: number,
    offset?: number
  ): Promise<ParentOrder[]> {
    let query = `SELECT * FROM parent_orders WHERE customer_id = ? ORDER BY created_at DESC`;
    const params: any[] = [customerId];

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

    return rows.map((row: any) => this.mapRowToParentOrder(row));
  }

  async findAll(limit?: number, offset?: number): Promise<ParentOrder[]> {
    let query = `SELECT * FROM parent_orders ORDER BY created_at DESC`;
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

    return rows.map((row: any) => this.mapRowToParentOrder(row));
  }

  async create(
    order: Omit<ParentOrder, "id" | "createdAt" | "updatedAt">
  ): Promise<ParentOrder> {
    const [result] = await this.db.execute(
      `INSERT INTO parent_orders (customer_id, order_number, total_amount, currency, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        order.customerId,
        order.orderNumber,
        order.totalAmount,
        order.currency,
        order.status,
      ]
    );

    const insertResult = result as any;
    const newId = insertResult.insertId;

    const createdOrder = await this.findById(newId);
    if (!createdOrder) {
      throw new Error("Failed to create parent order");
    }

    return createdOrder;
  }

  async update(
    id: number,
    order: Partial<ParentOrder>
  ): Promise<ParentOrder | null> {
    const existingOrder = await this.findById(id);
    if (!existingOrder) {
      return null;
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (order.orderNumber !== undefined) {
      updateFields.push("order_number = ?");
      updateValues.push(order.orderNumber);
    }
    if (order.totalAmount !== undefined) {
      updateFields.push("total_amount = ?");
      updateValues.push(order.totalAmount);
    }
    if (order.currency !== undefined) {
      updateFields.push("currency = ?");
      updateValues.push(order.currency);
    }
    if (order.status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(order.status);
    }

    if (updateFields.length === 0) {
      return existingOrder;
    }

    updateFields.push("updated_at = NOW()");
    updateValues.push(id);

    await this.db.execute(
      `UPDATE parent_orders SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.db.execute(
      `DELETE FROM parent_orders WHERE id = ?`,
      [id]
    );
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }

  async count(): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM parent_orders`
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async countByCustomerId(customerId: number): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM parent_orders WHERE customer_id = ?`,
      [customerId]
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD-${timestamp}-${random}`;
  }

  private mapRowToParentOrder(row: any): ParentOrder {
    const props: ParentOrderProps = {
      id: row.id,
      customerId: row.customer_id,
      orderNumber: row.order_number,
      totalAmount: Number(row.total_amount),
      currency: row.currency,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new ParentOrder(props);
  }
}
