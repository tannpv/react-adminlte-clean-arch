import { ProductStatus } from '../../domain/entities/product.entity';
export declare class UpdateProductDto {
    sku?: string;
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    status?: ProductStatus;
    metadata?: Record<string, unknown>;
    categories?: number[];
}
