import { CreateCategoryDto } from "../../../application/dto/create-category.dto";
import { UpdateCategoryDto } from "../../../application/dto/update-category.dto";
import { CategoriesService } from "../../../application/services/categories.service";
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    list(search?: string): Promise<import("../../../application/dto/category-response.dto").CategoryTreeResponseDto>;
    create(dto: CreateCategoryDto): Promise<import("../../../application/dto/category-response.dto").CategoryResponseDto>;
    update(id: number, dto: UpdateCategoryDto): Promise<import("../../../application/dto/category-response.dto").CategoryResponseDto>;
    remove(id: number): Promise<import("../../../application/dto/category-response.dto").CategoryResponseDto>;
}
