import { OrderItem } from "../entities/order-item.entity";

export const ORDER_ITEM_REPOSITORY = Symbol("ORDER_ITEM_REPOSITORY");

export interface OrderItemRepository {
  findById(id: number): Promise<OrderItem | null>;
  findByStoreOrderId(storeOrderId: number): Promise<OrderItem[]>;
  findByProductId(
    productId: number,
    limit?: number,
    offset?: number
  ): Promise<OrderItem[]>;
  findAll(limit?: number, offset?: number): Promise<OrderItem[]>;
  create(item: Omit<OrderItem, "id" | "createdAt">): Promise<OrderItem>;
  update(id: number, item: Partial<OrderItem>): Promise<OrderItem | null>;
  delete(id: number): Promise<boolean>;
  deleteByStoreOrderId(storeOrderId: number): Promise<boolean>;
  count(): Promise<number>;
  countByStoreOrderId(storeOrderId: number): Promise<number>;
  countByProductId(productId: number): Promise<number>;
}
