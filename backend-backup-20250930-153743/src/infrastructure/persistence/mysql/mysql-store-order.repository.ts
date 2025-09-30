import { Injectable } from "@nestjs/common";
import {
  StoreOrder,
  StoreOrderProps,
} from "../../../domain/entities/store-order.entity";
import { StoreOrderRepository } from "../../../domain/repositories/store-order.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlStoreOrderRepository implements StoreOrderRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<StoreOrder | null> {
    const [rows] = await this.db.execute(
      `SELECT * FROM store_orders WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return this.mapRowToStoreOrder(row);
  }

  async findByOrderNumber(orderNumber: string): Promise<StoreOrder | null> {
    const [rows] = await this.db.execute(
      `SELECT * FROM store_orders WHERE order_number = ?`,
      [orderNumber]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return this.mapRowToStoreOrder(row);
  }

  async findByParentOrderId(parentOrderId: number): Promise<StoreOrder[]> {
    const [rows] = await this.db.execute(
      `SELECT * FROM store_orders WHERE parent_order_id = ? ORDER BY created_at ASC`,
      [parentOrderId]
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => this.mapRowToStoreOrder(row));
  }

  async findByStoreId(
    storeId: number,
    limit?: number,
    offset?: number
  ): Promise<StoreOrder[]> {
    let query = `SELECT * FROM store_orders WHERE store_id = ? ORDER BY created_at DESC`;
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

    return rows.map((row: any) => this.mapRowToStoreOrder(row));
  }

  async findByCustomerId(
    customerId: number,
    limit?: number,
    offset?: number
  ): Promise<StoreOrder[]> {
    let query = `SELECT * FROM store_orders WHERE customer_id = ? ORDER BY created_at DESC`;
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

    return rows.map((row: any) => this.mapRowToStoreOrder(row));
  }

  async findAll(limit?: number, offset?: number): Promise<StoreOrder[]> {
    let query = `SELECT * FROM store_orders ORDER BY created_at DESC`;
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

    return rows.map((row: any) => this.mapRowToStoreOrder(row));
  }

  async create(
    order: Omit<StoreOrder, "id" | "createdAt" | "updatedAt">
  ): Promise<StoreOrder> {
    const [result] = await this.db.execute(
      `INSERT INTO store_orders (parent_order_id, customer_id, store_id, order_number, status, total_amount, currency, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        order.parentOrderId,
        order.customerId,
        order.storeId,
        order.orderNumber,
        order.status,
        order.totalAmount,
        order.currency,
      ]
    );

    const insertResult = result as any;
    const newId = insertResult.insertId;

    const createdOrder = await this.findById(newId);
    if (!createdOrder) {
      throw new Error("Failed to create store order");
    }

    return createdOrder;
  }

  async update(
    id: number,
    order: Partial<StoreOrder>
  ): Promise<StoreOrder | null> {
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
    if (order.status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(order.status);
    }
    if (order.totalAmount !== undefined) {
      updateFields.push("total_amount = ?");
      updateValues.push(order.totalAmount);
    }
    if (order.currency !== undefined) {
      updateFields.push("currency = ?");
      updateValues.push(order.currency);
    }

    if (updateFields.length === 0) {
      return existingOrder;
    }

    updateFields.push("updated_at = NOW()");
    updateValues.push(id);

    await this.db.execute(
      `UPDATE store_orders SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.db.execute(
      `DELETE FROM store_orders WHERE id = ?`,
      [id]
    );
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }

  async count(): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM store_orders`
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async countByStoreId(storeId: number): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM store_orders WHERE store_id = ?`,
      [storeId]
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async countByCustomerId(customerId: number): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM store_orders WHERE customer_id = ?`,
      [customerId]
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async generateOrderNumber(
    parentOrderId: number,
    storeId: number
  ): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    return `ORD-${parentOrderId}-${storeId}-${random}`;
  }

  private mapRowToStoreOrder(row: any): StoreOrder {
    const props: StoreOrderProps = {
      id: row.id,
      parentOrderId: row.parent_order_id,
      customerId: row.customer_id,
      storeId: row.store_id,
      orderNumber: row.order_number,
      status: row.status,
      totalAmount: Number(row.total_amount),
      currency: row.currency,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new StoreOrder(props);
  }
}
