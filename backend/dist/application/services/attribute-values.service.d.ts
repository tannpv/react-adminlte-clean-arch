import { AttributeValueRepository } from "../../domain/repositories/attribute-value.repository";
import { AttributeRepository } from "../../domain/repositories/attribute.repository";
import { AttributeValueResponseDto } from "../dto/attribute-value-response.dto";
import { CreateAttributeValueDto } from "../dto/create-attribute-value.dto";
import { UpdateAttributeValueDto } from "../dto/update-attribute-value.dto";
export declare class AttributeValuesService {
    private readonly attributeValueRepository;
    private readonly attributeRepository;
    constructor(attributeValueRepository: AttributeValueRepository, attributeRepository: AttributeRepository);
    findAll(): Promise<AttributeValueResponseDto[]>;
    findById(id: number): Promise<AttributeValueResponseDto>;
    findByAttributeId(attributeId: number): Promise<AttributeValueResponseDto[]>;
    create(createAttributeValueDto: CreateAttributeValueDto): Promise<AttributeValueResponseDto>;
    update(id: number, updateAttributeValueDto: UpdateAttributeValueDto): Promise<AttributeValueResponseDto>;
    delete(id: number): Promise<void>;
    private mapToResponseDto;
}
