import { Category } from "../../../domain/entities/category.entity";
import { CategoryRepository } from "../../../domain/repositories/category.repository";
import { MysqlDatabaseService } from "./mysql-database.service";
export declare class MysqlCategoryRepository implements CategoryRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findAll(search?: string): Promise<Category[]>;
    findById(id: number): Promise<Category | null>;
    findByIds(ids: number[]): Promise<Category[]>;
    findByName(name: string): Promise<Category | null>;
    create(category: Category): Promise<Category>;
    update(category: Category): Promise<Category>;
    remove(id: number): Promise<Category | null>;
    nextId(): Promise<number>;
}
