import { ProductVariant } from '../../domain/entities/product-variant.entity';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
export declare class ProductVariantsService {
    private readonly productVariantRepository;
    constructor(productVariantRepository: ProductVariantRepository);
    create(createDto: CreateProductVariantDto): Promise<ProductVariant>;
    findAll(): Promise<ProductVariant[]>;
    findByProductId(productId: number): Promise<ProductVariant[]>;
    findOne(id: number): Promise<ProductVariant | null>;
    findBySku(sku: string): Promise<ProductVariant | null>;
    update(id: number, updateDto: UpdateProductVariantDto): Promise<ProductVariant>;
    remove(id: number): Promise<void>;
    removeByProductId(productId: number): Promise<void>;
}
