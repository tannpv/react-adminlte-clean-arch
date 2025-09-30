import { Injectable } from "@nestjs/common";
import {
  OrderItem,
  OrderItemProps,
} from "../../../domain/entities/order-item.entity";
import { OrderItemRepository } from "../../../domain/repositories/order-item.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlOrderItemRepository implements OrderItemRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<OrderItem | null> {
    const [rows] = await this.db.execute(
      `SELECT * FROM order_items WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return this.mapRowToOrderItem(row);
  }

  async findByStoreOrderId(storeOrderId: number): Promise<OrderItem[]> {
    const [rows] = await this.db.execute(
      `SELECT * FROM order_items WHERE store_order_id = ? ORDER BY created_at ASC`,
      [storeOrderId]
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => this.mapRowToOrderItem(row));
  }

  async findByProductId(
    productId: number,
    limit?: number,
    offset?: number
  ): Promise<OrderItem[]> {
    let query = `SELECT * FROM order_items WHERE product_id = ? ORDER BY created_at DESC`;
    const params: any[] = [productId];

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

    return rows.map((row: any) => this.mapRowToOrderItem(row));
  }

  async findAll(limit?: number, offset?: number): Promise<OrderItem[]> {
    let query = `SELECT * FROM order_items ORDER BY created_at DESC`;
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

    return rows.map((row: any) => this.mapRowToOrderItem(row));
  }

  async create(item: Omit<OrderItem, "id" | "createdAt">): Promise<OrderItem> {
    const [result] = await this.db.execute(
      `INSERT INTO order_items (store_order_id, product_id, quantity, unit_price, total_price, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        item.storeOrderId,
        item.productId,
        item.quantity,
        item.unitPrice,
        item.totalPrice,
      ]
    );

    const insertResult = result as any;
    const newId = insertResult.insertId;

    const createdItem = await this.findById(newId);
    if (!createdItem) {
      throw new Error("Failed to create order item");
    }

    return createdItem;
  }

  async update(
    id: number,
    item: Partial<OrderItem>
  ): Promise<OrderItem | null> {
    const existingItem = await this.findById(id);
    if (!existingItem) {
      return null;
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (item.quantity !== undefined) {
      updateFields.push("quantity = ?");
      updateValues.push(item.quantity);
    }
    if (item.unitPrice !== undefined) {
      updateFields.push("unit_price = ?");
      updateValues.push(item.unitPrice);
    }
    if (item.totalPrice !== undefined) {
      updateFields.push("total_price = ?");
      updateValues.push(item.totalPrice);
    }

    if (updateFields.length === 0) {
      return existingItem;
    }

    updateValues.push(id);

    await this.db.execute(
      `UPDATE order_items SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.db.execute(
      `DELETE FROM order_items WHERE id = ?`,
      [id]
    );
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }

  async deleteByStoreOrderId(storeOrderId: number): Promise<boolean> {
    const [result] = await this.db.execute(
      `DELETE FROM order_items WHERE store_order_id = ?`,
      [storeOrderId]
    );
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }

  async count(): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM order_items`
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async countByStoreOrderId(storeOrderId: number): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM order_items WHERE store_order_id = ?`,
      [storeOrderId]
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async countByProductId(productId: number): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM order_items WHERE product_id = ?`,
      [productId]
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  private mapRowToOrderItem(row: any): OrderItem {
    const props: OrderItemProps = {
      id: row.id,
      storeOrderId: row.store_order_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
      totalPrice: Number(row.total_price),
      createdAt: new Date(row.created_at),
    };

    return new OrderItem(props);
  }
}
