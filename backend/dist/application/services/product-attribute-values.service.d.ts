import { ProductAttributeValue } from "../../domain/entities/product-attribute-value.entity";
import { ProductAttributeValueRepository } from "../../domain/repositories/product-attribute-value.repository";
import { CreateProductAttributeValueDto } from "../dto/create-product-attribute-value.dto";
import { UpdateProductAttributeValueDto } from "../dto/update-product-attribute-value.dto";
export declare class ProductAttributeValuesService {
    private readonly productAttributeValueRepository;
    constructor(productAttributeValueRepository: ProductAttributeValueRepository);
    create(createDto: CreateProductAttributeValueDto): Promise<ProductAttributeValue>;
    findAll(): Promise<ProductAttributeValue[]>;
    findByProductId(productId: number): Promise<ProductAttributeValue[]>;
    findByAttributeId(attributeId: number): Promise<ProductAttributeValue[]>;
    findOne(id: number): Promise<ProductAttributeValue | null>;
    findByProductAndAttribute(productId: number, attributeId: number): Promise<ProductAttributeValue | null>;
    update(id: number, updateDto: UpdateProductAttributeValueDto): Promise<ProductAttributeValue>;
    remove(id: number): Promise<void>;
    removeByProductId(productId: number): Promise<void>;
    removeByProductAndAttribute(productId: number, attributeId: number): Promise<void>;
}
