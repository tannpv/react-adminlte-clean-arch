import { AttributeRepository } from "../../domain/repositories/attribute.repository";
import { AttributeResponseDto } from "../dto/attribute-response.dto";
import { CreateAttributeDto } from "../dto/create-attribute.dto";
import { UpdateAttributeDto } from "../dto/update-attribute.dto";
export declare class AttributesService {
    private readonly attributeRepository;
    constructor(attributeRepository: AttributeRepository);
    findAll(): Promise<AttributeResponseDto[]>;
    findById(id: number): Promise<AttributeResponseDto>;
    findByCode(code: string): Promise<AttributeResponseDto>;
    create(createAttributeDto: CreateAttributeDto): Promise<AttributeResponseDto>;
    update(id: number, updateAttributeDto: UpdateAttributeDto): Promise<AttributeResponseDto>;
    delete(id: number): Promise<void>;
    private mapToResponseDto;
}
