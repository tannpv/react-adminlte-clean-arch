import { AttributeValueResponseDto } from "../../../application/dto/attribute-value-response.dto";
import { CreateAttributeValueDto } from "../../../application/dto/create-attribute-value.dto";
import { UpdateAttributeValueDto } from "../../../application/dto/update-attribute-value.dto";
import { AttributeValuesService } from "../../../application/services/attribute-values.service";
export declare class AttributeValuesController {
    private readonly attributeValuesService;
    constructor(attributeValuesService: AttributeValuesService);
    findAll(): Promise<AttributeValueResponseDto[]>;
    findByAttributeId(attributeId: number): Promise<AttributeValueResponseDto[]>;
    findById(id: number): Promise<AttributeValueResponseDto>;
    create(createAttributeValueDto: CreateAttributeValueDto): Promise<AttributeValueResponseDto>;
    update(id: number, updateAttributeValueDto: UpdateAttributeValueDto): Promise<AttributeValueResponseDto>;
    delete(id: number): Promise<void>;
}
