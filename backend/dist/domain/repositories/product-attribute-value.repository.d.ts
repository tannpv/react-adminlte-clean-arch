import { ProductAttributeValue } from "../entities/product-attribute-value.entity";
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
    findProductsByAttributeValues(attributeValueIds: number[]): Promise<number[]>;
    getFacetedSearchData(attributeId: number): Promise<Array<{
        attributeValueId: number;
        label: string;
        productCount: number;
    }>>;
    getMultiAttributeFacetedSearchData(attributeIds: number[]): Promise<Record<number, Array<{
        attributeValueId: number;
        label: string;
        productCount: number;
    }>>>;
    filterProductsByAttributes(attributeFilters: Array<{
        attributeId: number;
        attributeValueIds: number[];
    }>): Promise<number[]>;
}
