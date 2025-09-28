import { ProductVariant } from '../../domain/entities/product-variant.entity';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ProductAttributeValuesService } from './product-attribute-values.service';
import { AttributeValuesService } from './attribute-values.service';
export declare class ProductVariantsService {
    private readonly productVariantRepository;
    private readonly productAttributeValuesService;
    private readonly attributeValuesService;
    constructor(productVariantRepository: ProductVariantRepository, productAttributeValuesService: ProductAttributeValuesService, attributeValuesService: AttributeValuesService);
    create(createDto: CreateProductVariantDto): Promise<ProductVariant>;
    findAll(): Promise<ProductVariant[]>;
    findByProductId(productId: number): Promise<ProductVariant[]>;
    findOne(id: number): Promise<ProductVariant | null>;
    findBySku(sku: string): Promise<ProductVariant | null>;
    update(id: number, updateDto: UpdateProductVariantDto): Promise<ProductVariant>;
    remove(id: number): Promise<void>;
    removeByProductId(productId: number): Promise<void>;
    getVariantAttributeValues(variantId: number): Promise<any[]>;
    setVariantAttributeValues(variantId: number, attributeValues: Record<string, any>): Promise<void>;
    generateVariantsFromAttributes(productId: number): Promise<ProductVariant[]>;
    private generateCombinations;
}
