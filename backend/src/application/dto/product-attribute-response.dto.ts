import { ProductAttributeInputType } from '../../domain/entities/product-attribute.entity'

export interface ProductAttributeTermResponseDto {
  id: number
  name: string
  slug: string
  order: number
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface ProductAttributeResponseDto {
  id: number
  name: string
  slug: string
  description: string | null
  inputType: ProductAttributeInputType
  terms: ProductAttributeTermResponseDto[]
  createdAt: string
  updatedAt: string
}
