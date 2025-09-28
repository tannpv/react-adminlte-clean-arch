import { ProductVariant } from '../../../domain/entities/product-variant.entity';
import { ProductVariantRepository } from '../../../domain/repositories/product-variant.repository';
import { MysqlDatabaseService } from './mysql-database.service';
export declare class MysqlProductVariantRepository implements ProductVariantRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findAll(): Promise<ProductVariant[]>;
    findById(id: number): Promise<ProductVariant | null>;
    findByProductId(productId: number): Promise<ProductVariant[]>;
    findBySku(sku: string): Promise<ProductVariant | null>;
    save(productVariant: ProductVariant): Promise<ProductVariant>;
    update(id: number, productVariant: ProductVariant): Promise<ProductVariant>;
    delete(id: number): Promise<void>;
    deleteByProductId(productId: number): Promise<void>;
    private mapRowToEntity;
}
