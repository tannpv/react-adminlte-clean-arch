import { AttributeSetResponseDto } from "../../../application/dto/attribute-set-response.dto";
import { CreateAttributeSetDto } from "../../../application/dto/create-attribute-set.dto";
import { UpdateAttributeSetDto } from "../../../application/dto/update-attribute-set.dto";
import { AttributeSetsService } from "../../../application/services/attribute-sets.service";
export declare class AttributeSetsController {
    private readonly attributeSetsService;
    constructor(attributeSetsService: AttributeSetsService);
    findAll(): Promise<AttributeSetResponseDto[]>;
    findByName(name: string): Promise<AttributeSetResponseDto>;
    findById(id: number): Promise<AttributeSetResponseDto>;
    create(createAttributeSetDto: CreateAttributeSetDto): Promise<AttributeSetResponseDto>;
    update(id: number, updateAttributeSetDto: UpdateAttributeSetDto): Promise<AttributeSetResponseDto>;
    delete(id: number): Promise<void>;
    addAttributeToSet(attributeSetId: number, attributeId: number, body: {
        sortOrder?: number;
        isRequired?: boolean;
    }): Promise<void>;
    removeAttributeFromSet(attributeSetId: number, attributeId: number): Promise<void>;
}
