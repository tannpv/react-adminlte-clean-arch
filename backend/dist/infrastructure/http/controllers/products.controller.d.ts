import { ProductsService } from '../../../application/services/products.service';
import { CreateProductDto } from '../../../application/dto/create-product.dto';
import { UpdateProductDto } from '../../../application/dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto[]>;
    getOne(id: number): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto>;
    create(dto: CreateProductDto): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto>;
    update(id: number, dto: UpdateProductDto): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto>;
    remove(id: number): Promise<import("../../../application/dto/product-response.dto").ProductResponseDto>;
}
