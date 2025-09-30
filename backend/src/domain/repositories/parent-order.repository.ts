import { ParentOrder } from "../entities/parent-order.entity";

export const PARENT_ORDER_REPOSITORY = Symbol("PARENT_ORDER_REPOSITORY");

export interface ParentOrderRepository {
  findById(id: number): Promise<ParentOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<ParentOrder | null>;
  findByCustomerId(
    customerId: number,
    limit?: number,
    offset?: number
  ): Promise<ParentOrder[]>;
  findAll(limit?: number, offset?: number): Promise<ParentOrder[]>;
  create(
    order: Omit<ParentOrder, "id" | "createdAt" | "updatedAt">
  ): Promise<ParentOrder>;
  update(id: number, order: Partial<ParentOrder>): Promise<ParentOrder | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
  countByCustomerId(customerId: number): Promise<number>;
  generateOrderNumber(): Promise<string>;
}
