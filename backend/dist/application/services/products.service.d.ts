import { CategoryRepository } from "../../domain/repositories/category.repository";
import { ProductRepository } from "../../domain/repositories/product.repository";
import { DomainEventBus } from "../../shared/events/domain-event.bus";
import { CreateProductDto } from "../dto/create-product.dto";
import { ProductResponseDto } from "../dto/product-response.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
export declare class ProductsService {
    private readonly products;
    private readonly categories;
    private readonly events;
    constructor(products: ProductRepository, categories: CategoryRepository, events: DomainEventBus);
    list(): Promise<ProductResponseDto[]>;
    findById(id: number): Promise<ProductResponseDto>;
    create(dto: CreateProductDto): Promise<ProductResponseDto>;
    update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto>;
    remove(id: number): Promise<ProductResponseDto>;
    private ensureSkuUnique;
    private resolveCategories;
    private toPriceCents;
}
