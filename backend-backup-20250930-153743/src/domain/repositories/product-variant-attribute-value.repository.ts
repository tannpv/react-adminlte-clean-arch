import { ProductVariantAttributeValue } from '../entities/product-variant-attribute-value.entity';

export interface ProductVariantAttributeValueRepository {
  findById(id: number): Promise<ProductVariantAttributeValue | null>;
  findByVariantId(variantId: number): Promise<ProductVariantAttributeValue[]>;
  findByAttributeId(attributeId: number): Promise<ProductVariantAttributeValue[]>;
  findByVariantAndAttribute(variantId: number, attributeId: number): Promise<ProductVariantAttributeValue | null>;
  save(productVariantAttributeValue: ProductVariantAttributeValue): Promise<ProductVariantAttributeValue>;
  update(id: number, productVariantAttributeValue: ProductVariantAttributeValue): Promise<ProductVariantAttributeValue>;
  delete(id: number): Promise<void>;
  deleteByVariantId(variantId: number): Promise<void>;
  deleteByVariantAndAttribute(variantId: number, attributeId: number): Promise<void>;
}

