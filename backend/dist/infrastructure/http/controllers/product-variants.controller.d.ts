import { CreateProductVariantDto } from "../../../application/dto/create-product-variant.dto";
import { UpdateProductVariantDto } from "../../../application/dto/update-product-variant.dto";
import { ProductVariantsService } from "../../../application/services/product-variants.service";
export declare class ProductVariantsController {
    private readonly productVariantsService;
    constructor(productVariantsService: ProductVariantsService);
    findAll(productId?: string): Promise<import("../../../domain/entities/product-variant.entity").ProductVariant[]>;
    findOne(id: number): Promise<import("../../../domain/entities/product-variant.entity").ProductVariant | null>;
    getVariantAttributeValues(id: number): Promise<any[]>;
    create(dto: CreateProductVariantDto): Promise<import("../../../domain/entities/product-variant.entity").ProductVariant>;
    update(id: number, dto: UpdateProductVariantDto): Promise<import("../../../domain/entities/product-variant.entity").ProductVariant>;
    remove(id: number): Promise<void>;
    setVariantAttributeValues(id: number, attributeValues: Record<string, any>): Promise<void>;
    generateVariants(productId: number): Promise<import("../../../domain/entities/product-variant.entity").ProductVariant[]>;
}
