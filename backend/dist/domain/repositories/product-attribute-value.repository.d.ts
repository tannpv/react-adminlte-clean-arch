import { ProductAttributeValue } from '../entities/product-attribute-value.entity';
export interface ProductAttributeValueRepository {
    findById(id: number): Promise<ProductAttributeValue | null>;
    findByProductId(productId: number): Promise<ProductAttributeValue[]>;
    findByAttributeId(attributeId: number): Promise<ProductAttributeValue[]>;
    findByProductAndAttribute(productId: number, attributeId: number): Promise<ProductAttributeValue | null>;
    save(productAttributeValue: ProductAttributeValue): Promise<ProductAttributeValue>;
    update(id: number, productAttributeValue: ProductAttributeValue): Promise<ProductAttributeValue>;
    delete(id: number): Promise<void>;
    deleteByProductId(productId: number): Promise<void>;
    deleteByProductAndAttribute(productId: number, attributeId: number): Promise<void>;
}
