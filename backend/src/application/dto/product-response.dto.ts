import { ProductStatus, ProductType } from '../../domain/entities/product.entity'

export interface ProductAttributeTermResponseDto {
  termId: number
  termName: string
  termSlug: string
}

export interface ProductAttributeResponseDto {
  attributeId: number
  attributeName: string
  attributeSlug: string
  terms: ProductAttributeTermResponseDto[]
  visible: boolean
  variation: boolean
}

export interface ProductVariantAttributeResponseDto {
  attributeId: number
  attributeName: string
  attributeSlug: string
  termId: number
  termName: string
  termSlug: string
}

export interface ProductVariantResponseDto {
  id: number
  sku: string
  priceCents: number
  salePriceCents: number | null
  currency: string
  status: ProductStatus
  stockQuantity: number | null
  metadata: Record<string, unknown> | null
  attributes: ProductVariantAttributeResponseDto[]
  createdAt: string
  updatedAt: string
}

export interface ProductResponseDto {
  id: number
  sku: string
  name: string
  description: string | null
  priceCents: number
  currency: string
  status: ProductStatus
  metadata: Record<string, unknown> | null
  categories: { id: number; name: string }[]
  attributeSetId: number
  type: ProductType
  attributes: ProductAttributeResponseDto[]
  variants: ProductVariantResponseDto[]
  createdAt: string
  updatedAt: string
}
