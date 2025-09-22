import { CreateProductDto } from "../../../application/dto/create-product.dto";
import { UpdateProductDto } from "../../../application/dto/update-product.dto";
import { ProductsService } from "../../../application/services/products.service";
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(search?: string): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto[]>;
    getOne(id: number): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto>;
    getProductAttributeValues(id: number): Promise<import("../../../domain/entities/product-attribute-value.entity").ProductAttributeValue[]>;
    create(dto: CreateProductDto): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto>;
    update(id: number, dto: UpdateProductDto): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto>;
    remove(id: number): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto>;
}
