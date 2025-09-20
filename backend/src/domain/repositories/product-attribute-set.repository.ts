import { ProductAttributeSet } from '../entities/product-attribute-set.entity'

export interface ProductAttributeSetRepository {
  findAll(): Promise<ProductAttributeSet[]>
  findById(id: number): Promise<ProductAttributeSet | null>
  findBySlug(slug: string): Promise<ProductAttributeSet | null>
  create(set: ProductAttributeSet): Promise<ProductAttributeSet>
  update(set: ProductAttributeSet): Promise<ProductAttributeSet>
  remove(id: number): Promise<ProductAttributeSet | null>
  assignAttributes(setId: number, attributeIds: number[], sortOrders?: Record<number, number>): Promise<void>
  nextId(): Promise<number>
}

export const PRODUCT_ATTRIBUTE_SET_REPOSITORY = 'PRODUCT_ATTRIBUTE_SET_REPOSITORY'
