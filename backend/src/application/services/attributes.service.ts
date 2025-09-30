import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Attribute } from "../../domain/entities/attribute.entity";
import { AttributeRepository } from "../../domain/repositories/attribute.repository";
import { AttributeResponseDto } from "../dto/attribute-response.dto";
import { CreateAttributeDto } from "../dto/create-attribute.dto";
import { UpdateAttributeDto } from "../dto/update-attribute.dto";

@Injectable()
export class AttributesService {
  constructor(
    @Inject("AttributeRepository")
    private readonly attributeRepository: AttributeRepository
  ) {}

  async findAll(): Promise<AttributeResponseDto[]> {
    const attributes = await this.attributeRepository.findAll();
    return attributes.map((attribute) => this.mapToResponseDto(attribute));
  }

  async findById(id: number): Promise<AttributeResponseDto> {
    const attribute = await this.attributeRepository.findById(id);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }
    return this.mapToResponseDto(attribute);
  }

  async findByCode(code: string): Promise<AttributeResponseDto> {
    const attribute = await this.attributeRepository.findByCode(code);
    if (!attribute) {
      throw new NotFoundException(`Attribute with code ${code} not found`);
    }
    return this.mapToResponseDto(attribute);
  }

  async create(
    createAttributeDto: CreateAttributeDto
  ): Promise<AttributeResponseDto> {
    // Check if attribute code already exists
    const existingAttribute = await this.attributeRepository.findByCode(
      createAttributeDto.code
    );
    if (existingAttribute) {
      throw new ConflictException(
        `Attribute with code ${createAttributeDto.code} already exists`
      );
    }

    const attribute = Attribute.create(
      createAttributeDto.code,
      createAttributeDto.name,
      createAttributeDto.inputType,
      createAttributeDto.dataType,
      createAttributeDto.unit
    );

    const savedAttribute = await this.attributeRepository.create(attribute);
    return this.mapToResponseDto(savedAttribute);
  }

  async update(
    id: number,
    updateAttributeDto: UpdateAttributeDto
  ): Promise<AttributeResponseDto> {
    const existingAttribute = await this.attributeRepository.findById(id);
    if (!existingAttribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    // Check if new code conflicts with existing attributes
    if (
      updateAttributeDto.code &&
      updateAttributeDto.code !== existingAttribute.code
    ) {
      const codeExists = await this.attributeRepository.existsByCode(
        updateAttributeDto.code,
        id
      );
      if (codeExists) {
        throw new ConflictException(
          `Attribute with code ${updateAttributeDto.code} already exists`
        );
      }
    }

    const updatedAttribute = existingAttribute.update(
      updateAttributeDto.code,
      updateAttributeDto.name,
      updateAttributeDto.inputType,
      updateAttributeDto.dataType,
      updateAttributeDto.unit
    );

    const savedAttribute = await this.attributeRepository.update(
      updatedAttribute
    );
    return this.mapToResponseDto(savedAttribute);
  }

  async delete(id: number): Promise<void> {
    const attribute = await this.attributeRepository.findById(id);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    await this.attributeRepository.delete(id);
  }

  private mapToResponseDto(attribute: Attribute): AttributeResponseDto {
    return new AttributeResponseDto(
      attribute.id,
      attribute.code,
      attribute.name,
      attribute.inputType,
      attribute.dataType,
      attribute.unit,
      attribute.createdAt,
      attribute.updatedAt
    );
  }
}
