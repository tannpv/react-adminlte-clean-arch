import { CategoryRepository } from "../../domain/repositories/category.repository";
import { CategoryResponseDto, CategoryTreeResponseDto } from "../dto/category-response.dto";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";
export declare class CategoriesService {
    private readonly categories;
    constructor(categories: CategoryRepository);
    list(search?: string): Promise<CategoryTreeResponseDto>;
    create(dto: CreateCategoryDto): Promise<CategoryResponseDto>;
    update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto>;
    remove(id: number): Promise<CategoryResponseDto>;
    private toResponse;
    private validateParent;
    private buildHierarchyOptions;
    private buildCategoryTree;
}
