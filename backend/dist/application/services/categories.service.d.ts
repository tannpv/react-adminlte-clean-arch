import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto, CategoryTreeResponseDto } from '../dto/category-response.dto';
export declare class CategoriesService {
    private readonly categories;
    constructor(categories: CategoryRepository);
    list(): Promise<CategoryTreeResponseDto>;
    create(dto: CreateCategoryDto): Promise<CategoryResponseDto>;
    update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto>;
    remove(id: number): Promise<CategoryResponseDto>;
    private toResponse;
    private validateParent;
    private buildHierarchyOptions;
    private buildCategoryTree;
}
