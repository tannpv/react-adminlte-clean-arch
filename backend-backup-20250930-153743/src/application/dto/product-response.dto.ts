import {
  ProductStatus,
  ProductType,
} from "../../domain/entities/product.entity";

export interface ProductResponseDto {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  status: ProductStatus;
  metadata: Record<string, unknown> | null;
  categories: { id: number; name: string }[];
  type: ProductType;
  createdAt: string;
  updatedAt: string;
}
