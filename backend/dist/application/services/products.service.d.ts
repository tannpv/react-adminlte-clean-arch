import { CategoryRepository } from "../../domain/repositories/category.repository";
import { ProductRepository } from "../../domain/repositories/product.repository";
import { DomainEventBus } from "../../shared/events/domain-event.bus";
import { CreateProductDto } from "../dto/create-product.dto";
import { ProductResponseDto } from "../dto/product-response.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { ProductAttributeValuesService } from "./product-attribute-values.service";
import { ProductVariantsService } from "./product-variants.service";
export declare class ProductsService {
    private readonly products;
    private readonly categories;
    private readonly events;
    private readonly productAttributeValuesService;
    private readonly productVariantsService;
    constructor(products: ProductRepository, categories: CategoryRepository, events: DomainEventBus, productAttributeValuesService: ProductAttributeValuesService, productVariantsService: ProductVariantsService);
    list(search?: string): Promise<ProductResponseDto[]>;
    findById(id: number): Promise<ProductResponseDto>;
    getProductAttributeValues(productId: number): Promise<import("../../domain/entities/product-attribute-value.entity").ProductAttributeValue[]>;
    create(dto: CreateProductDto): Promise<ProductResponseDto>;
    update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto>;
    remove(id: number): Promise<ProductResponseDto>;
    private ensureSkuUnique;
    private resolveCategories;
    private toPriceCents;
    private saveProductAttributeValues;
    getProductVariants(productId: number): Promise<any[]>;
}
