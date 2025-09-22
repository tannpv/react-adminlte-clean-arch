import { CreateProductAttributeValueDto } from "../../application/dto/create-product-attribute-value.dto";
import { UpdateProductAttributeValueDto } from "../../application/dto/update-product-attribute-value.dto";
import { ProductAttributeValuesService } from "../../application/services/product-attribute-values.service";
export declare class ProductAttributeValuesController {
    private readonly productAttributeValuesService;
    constructor(productAttributeValuesService: ProductAttributeValuesService);
    create(createProductAttributeValueDto: CreateProductAttributeValueDto): any;
    findAll(): any;
    findOne(id: number): any;
    findByProductId(productId: number): any;
    findByAttributeId(attributeId: number): any;
    findByProductAndAttribute(productId: number, attributeId: number): any;
    update(id: number, updateProductAttributeValueDto: UpdateProductAttributeValueDto): any;
    remove(id: number): any;
    removeByProductId(productId: number): any;
    removeByProductAndAttribute(productId: number, attributeId: number): any;
}
