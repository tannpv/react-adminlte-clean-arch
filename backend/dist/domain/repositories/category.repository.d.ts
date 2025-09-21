import { Category } from '../entities/category.entity';
export interface CategoryRepository {
    findAll(search?: string): Promise<Category[]>;
    findById(id: number): Promise<Category | null>;
    findByIds(ids: number[]): Promise<Category[]>;
    findByName(name: string): Promise<Category | null>;
    create(category: Category): Promise<Category>;
    update(category: Category): Promise<Category>;
    remove(id: number): Promise<Category | null>;
    nextId(): Promise<number>;
}
export declare const CATEGORY_REPOSITORY = "CATEGORY_REPOSITORY";
