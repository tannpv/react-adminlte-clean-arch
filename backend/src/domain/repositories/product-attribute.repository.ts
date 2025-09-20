import { ProductAttributeDefinition, ProductAttributeTerm } from '../entities/product-attribute.entity'

export interface ProductAttributeRepository {
  findAll(): Promise<ProductAttributeDefinition[]>
  findById(id: number): Promise<ProductAttributeDefinition | null>
  findBySlug(slug: string): Promise<ProductAttributeDefinition | null>
  create(definition: ProductAttributeDefinition): Promise<ProductAttributeDefinition>
  update(definition: ProductAttributeDefinition): Promise<ProductAttributeDefinition>
  remove(id: number): Promise<ProductAttributeDefinition | null>
  addTerm(attributeId: number, term: ProductAttributeTerm): Promise<ProductAttributeTerm>
  updateTerm(attributeId: number, term: ProductAttributeTerm): Promise<ProductAttributeTerm>
  removeTerm(attributeId: number, termId: number): Promise<ProductAttributeTerm | null>
  nextAttributeId(): Promise<number>
  nextTermId(attributeId: number): Promise<number>
}

export const PRODUCT_ATTRIBUTE_REPOSITORY = 'PRODUCT_ATTRIBUTE_REPOSITORY'
