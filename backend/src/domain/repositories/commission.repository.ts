import { Commission } from "../entities/commission.entity";

export const COMMISSION_REPOSITORY = Symbol("COMMISSION_REPOSITORY");

export interface CommissionRepository {
  findById(id: number): Promise<Commission | null>;
  findByStoreId(
    storeId: number,
    limit?: number,
    offset?: number
  ): Promise<Commission[]>;
  findByOrderItemId(orderItemId: number): Promise<Commission | null>;
  findByStatus(
    status: string,
    limit?: number,
    offset?: number
  ): Promise<Commission[]>;
  findAll(limit?: number, offset?: number): Promise<Commission[]>;
  create(
    commission: Omit<Commission, "id" | "createdAt" | "updatedAt">
  ): Promise<Commission>;
  update(
    id: number,
    commission: Partial<Commission>
  ): Promise<Commission | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
  countByStoreId(storeId: number): Promise<number>;
  countByStatus(status: string): Promise<number>;
  getTotalCommissionByStoreId(storeId: number): Promise<number>;
  getPendingCommissionByStoreId(storeId: number): Promise<number>;
}
