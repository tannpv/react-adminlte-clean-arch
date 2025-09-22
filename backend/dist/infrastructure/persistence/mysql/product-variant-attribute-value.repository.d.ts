import { ProductVariantAttributeValue } from '../../../domain/entities/product-variant-attribute-value.entity';
import { ProductVariantAttributeValueRepository } from '../../../domain/repositories/product-variant-attribute-value.repository';
import { MysqlDatabaseService } from './mysql-database.service';
export declare class MysqlProductVariantAttributeValueRepository implements ProductVariantAttributeValueRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findById(id: number): Promise<ProductVariantAttributeValue | null>;
    findByVariantId(variantId: number): Promise<ProductVariantAttributeValue[]>;
    findByAttributeId(attributeId: number): Promise<ProductVariantAttributeValue[]>;
    findByVariantAndAttribute(variantId: number, attributeId: number): Promise<ProductVariantAttributeValue | null>;
    save(productVariantAttributeValue: ProductVariantAttributeValue): Promise<ProductVariantAttributeValue>;
    update(id: number, productVariantAttributeValue: ProductVariantAttributeValue): Promise<ProductVariantAttributeValue>;
    delete(id: number): Promise<void>;
    deleteByVariantId(variantId: number): Promise<void>;
    deleteByVariantAndAttribute(variantId: number, attributeId: number): Promise<void>;
    private mapRowToEntity;
}
