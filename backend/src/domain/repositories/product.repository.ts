import { Product } from "../entities/product.entity";

export interface ProductRepository {
  findAll(search?: string): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  remove(id: number): Promise<Product | null>;
  nextId(): Promise<number>;
}

export const PRODUCT_REPOSITORY = "PRODUCT_REPOSITORY";
