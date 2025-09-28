import { AttributeResponseDto } from "../../../application/dto/attribute-response.dto";
import { CreateAttributeDto } from "../../../application/dto/create-attribute.dto";
import { UpdateAttributeDto } from "../../../application/dto/update-attribute.dto";
import { AttributesService } from "../../../application/services/attributes.service";
export declare class AttributesController {
    private readonly attributesService;
    constructor(attributesService: AttributesService);
    findAll(): Promise<AttributeResponseDto[]>;
    findById(id: number): Promise<AttributeResponseDto>;
    create(createAttributeDto: CreateAttributeDto): Promise<AttributeResponseDto>;
    update(id: number, updateAttributeDto: UpdateAttributeDto): Promise<AttributeResponseDto>;
    delete(id: number): Promise<void>;
}
