import { Product } from "../../domain/entities/product.entity";
import { ProductResponseDto } from "../dto/product-response.dto";

export function toProductResponse(product: Product): ProductResponseDto {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description ?? null,
    priceCents: product.priceCents,
    currency: product.currency,
    status: product.status,
    metadata: product.metadata ? { ...product.metadata } : null,
    categories: product.categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
    type: product.type,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
