import { CategoriesService } from '../../../application/services/categories.service';
import { CreateCategoryDto } from '../../../application/dto/create-category.dto';
import { UpdateCategoryDto } from '../../../application/dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    list(): Promise<{
        categories: import("../../../application/dto/category-response.dto").CategoryResponseDto[];
        hierarchy: import("../../../application/dto/category-response.dto").CategoryHierarchyOptionDto[];
    }>;
    create(dto: CreateCategoryDto): Promise<import("../../../application/dto/category-response.dto").CategoryResponseDto>;
    update(id: number, dto: UpdateCategoryDto): Promise<import("../../../application/dto/category-response.dto").CategoryResponseDto>;
    remove(id: number): Promise<import("../../../application/dto/category-response.dto").CategoryResponseDto>;
}
