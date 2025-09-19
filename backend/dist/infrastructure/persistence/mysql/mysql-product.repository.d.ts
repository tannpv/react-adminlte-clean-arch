import { Product } from '../../../domain/entities/product.entity';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { MysqlDatabaseService } from './mysql-database.service';
export declare class MysqlProductRepository implements ProductRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findAll(): Promise<Product[]>;
    findById(id: number): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    create(product: Product): Promise<Product>;
    update(product: Product): Promise<Product>;
    remove(id: number): Promise<Product | null>;
    nextId(): Promise<number>;
    private hydrate;
    private loadCategories;
    private replaceCategories;
}
