import { ProductStatus } from '../../domain/entities/product.entity'

export interface ProductResponseDto {
  id: number
  sku: string
  name: string
  description: string | null
  priceCents: number
  currency: string
  status: ProductStatus
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}
