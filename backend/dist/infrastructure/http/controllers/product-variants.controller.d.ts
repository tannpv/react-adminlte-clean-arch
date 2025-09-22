import { ProductVariantsService } from '../../application/services/product-variants.service';
import { CreateProductVariantDto } from '../../application/dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../../application/dto/update-product-variant.dto';
export declare class ProductVariantsController {
    private readonly productVariantsService;
    constructor(productVariantsService: ProductVariantsService);
    create(createProductVariantDto: CreateProductVariantDto): any;
    findAll(): any;
    findByProductId(productId: number): any;
    findBySku(sku: string): any;
    findOne(id: number): any;
    update(id: number, updateProductVariantDto: UpdateProductVariantDto): any;
    remove(id: number): any;
    removeByProductId(productId: number): any;
}
