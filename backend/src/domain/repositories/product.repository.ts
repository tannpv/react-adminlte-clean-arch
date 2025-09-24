import { Product } from "../entities/product.entity";
import { ProductSearchDto } from "../../application/dto/product-search.dto";

export interface ProductSearchResult {
  products: Product[];
  total: number;
  facets: {
    categories: Array<{ id: number; name: string; count: number }>;
    attributes: Array<{ id: number; name: string; values: Array<{ id: number; value: string; count: number }> }>;
    priceRange: { min: number; max: number };
    statuses: Array<{ status: string; count: number }>;
    types: Array<{ type: string; count: number }>;
  };
}

export interface ProductRepository {
  findAll(search?: string): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  remove(id: number): Promise<Product | null>;
  nextId(): Promise<number>;
  advancedSearch(searchDto: ProductSearchDto): Promise<ProductSearchResult>;
}

export const PRODUCT_REPOSITORY = "PRODUCT_REPOSITORY";
