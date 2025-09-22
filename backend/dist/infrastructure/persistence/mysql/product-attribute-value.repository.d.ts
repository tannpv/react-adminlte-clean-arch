import { ProductAttributeValue } from '../../../domain/entities/product-attribute-value.entity';
import { ProductAttributeValueRepository } from '../../../domain/repositories/product-attribute-value.repository';
import { MysqlDatabaseService } from './mysql-database.service';
export declare class MysqlProductAttributeValueRepository implements ProductAttributeValueRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findById(id: number): Promise<ProductAttributeValue | null>;
    findByProductId(productId: number): Promise<ProductAttributeValue[]>;
    findByAttributeId(attributeId: number): Promise<ProductAttributeValue[]>;
    findByProductAndAttribute(productId: number, attributeId: number): Promise<ProductAttributeValue | null>;
    save(productAttributeValue: ProductAttributeValue): Promise<ProductAttributeValue>;
    update(id: number, productAttributeValue: ProductAttributeValue): Promise<ProductAttributeValue>;
    delete(id: number): Promise<void>;
    deleteByProductId(productId: number): Promise<void>;
    deleteByProductAndAttribute(productId: number, attributeId: number): Promise<void>;
    private mapRowToEntity;
}
