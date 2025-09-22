import { ProductVariant } from '../entities/product-variant.entity';
export interface ProductVariantRepository {
    findById(id: number): Promise<ProductVariant | null>;
    findByProductId(productId: number): Promise<ProductVariant[]>;
    findBySku(sku: string): Promise<ProductVariant | null>;
    save(productVariant: ProductVariant): Promise<ProductVariant>;
    update(id: number, productVariant: ProductVariant): Promise<ProductVariant>;
    delete(id: number): Promise<void>;
    deleteByProductId(productId: number): Promise<void>;
}
