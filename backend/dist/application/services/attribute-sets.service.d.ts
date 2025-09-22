import { AttributeSetAssignmentRepository } from "../../domain/repositories/attribute-set-assignment.repository";
import { AttributeSetRepository } from "../../domain/repositories/attribute-set.repository";
import { AttributeRepository } from "../../domain/repositories/attribute.repository";
import { AttributeSetResponseDto } from "../dto/attribute-set-response.dto";
import { CreateAttributeSetDto } from "../dto/create-attribute-set.dto";
import { UpdateAttributeSetDto } from "../dto/update-attribute-set.dto";
export declare class AttributeSetsService {
    private readonly attributeSetRepository;
    private readonly attributeSetAssignmentRepository;
    private readonly attributeRepository;
    constructor(attributeSetRepository: AttributeSetRepository, attributeSetAssignmentRepository: AttributeSetAssignmentRepository, attributeRepository: AttributeRepository);
    findAll(): Promise<AttributeSetResponseDto[]>;
    findById(id: number): Promise<AttributeSetResponseDto>;
    findByName(name: string): Promise<AttributeSetResponseDto>;
    create(createAttributeSetDto: CreateAttributeSetDto): Promise<AttributeSetResponseDto>;
    update(id: number, updateAttributeSetDto: UpdateAttributeSetDto): Promise<AttributeSetResponseDto>;
    delete(id: number): Promise<void>;
    addAttributeToSet(attributeSetId: number, attributeId: number, sortOrder?: number, isRequired?: boolean): Promise<void>;
    removeAttributeFromSet(attributeSetId: number, attributeId: number): Promise<void>;
    private getAttributesForSet;
    private mapToResponseDto;
}
