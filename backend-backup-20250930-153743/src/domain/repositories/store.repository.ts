import { Store } from "../entities/store.entity";

export const STORE_REPOSITORY = Symbol("STORE_REPOSITORY");

export interface StoreRepository {
  findById(id: number): Promise<Store | null>;
  findBySlug(slug: string): Promise<Store | null>;
  findByUserId(userId: number): Promise<Store[]>;
  findByStatus(status: string): Promise<Store[]>;
  findAll(limit?: number, offset?: number): Promise<Store[]>;
  create(store: Omit<Store, "id" | "createdAt" | "updatedAt">): Promise<Store>;
  update(id: number, store: Partial<Store>): Promise<Store | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
  countByStatus(status: string): Promise<number>;
}
