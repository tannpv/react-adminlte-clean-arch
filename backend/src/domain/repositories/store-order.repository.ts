import { StoreOrder } from "../entities/store-order.entity";

export const STORE_ORDER_REPOSITORY = Symbol("STORE_ORDER_REPOSITORY");

export interface StoreOrderRepository {
  findById(id: number): Promise<StoreOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<StoreOrder | null>;
  findByParentOrderId(parentOrderId: number): Promise<StoreOrder[]>;
  findByStoreId(
    storeId: number,
    limit?: number,
    offset?: number
  ): Promise<StoreOrder[]>;
  findByCustomerId(
    customerId: number,
    limit?: number,
    offset?: number
  ): Promise<StoreOrder[]>;
  findAll(limit?: number, offset?: number): Promise<StoreOrder[]>;
  create(
    order: Omit<StoreOrder, "id" | "createdAt" | "updatedAt">
  ): Promise<StoreOrder>;
  update(id: number, order: Partial<StoreOrder>): Promise<StoreOrder | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
  countByStoreId(storeId: number): Promise<number>;
  countByCustomerId(customerId: number): Promise<number>;
  generateOrderNumber(parentOrderId: number, storeId: number): Promise<string>;
}
