import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AttributeValue } from "../../domain/entities/attribute-value.entity";
import { AttributeValueRepository } from "../../domain/repositories/attribute-value.repository";
import { AttributeRepository } from "../../domain/repositories/attribute.repository";
import { AttributeValueResponseDto } from "../dto/attribute-value-response.dto";
import { CreateAttributeValueDto } from "../dto/create-attribute-value.dto";
import { UpdateAttributeValueDto } from "../dto/update-attribute-value.dto";

@Injectable()
export class AttributeValuesService {
  constructor(
    @Inject("AttributeValueRepository")
    private readonly attributeValueRepository: AttributeValueRepository,
    @Inject("AttributeRepository")
    private readonly attributeRepository: AttributeRepository
  ) {}

  async findAll(): Promise<AttributeValueResponseDto[]> {
    const attributeValues = await this.attributeValueRepository.findAll();
    return attributeValues.map((value) => this.mapToResponseDto(value));
  }

  async findById(id: number): Promise<AttributeValueResponseDto> {
    const attributeValue = await this.attributeValueRepository.findById(id);
    if (!attributeValue) {
      throw new NotFoundException(`Attribute value with ID ${id} not found`);
    }
    return this.mapToResponseDto(attributeValue);
  }

  async findByAttributeId(
    attributeId: number
  ): Promise<AttributeValueResponseDto[]> {
    // Verify attribute exists
    const attribute = await this.attributeRepository.findById(attributeId);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }

    const attributeValues =
      await this.attributeValueRepository.findByAttributeId(attributeId);
    return attributeValues.map((value) => this.mapToResponseDto(value));
  }

  async create(
    createAttributeValueDto: CreateAttributeValueDto
  ): Promise<AttributeValueResponseDto> {
    // Verify attribute exists
    const attribute = await this.attributeRepository.findById(
      createAttributeValueDto.attributeId
    );
    if (!attribute) {
      throw new NotFoundException(
        `Attribute with ID ${createAttributeValueDto.attributeId} not found`
      );
    }

    // Check if value code already exists for this attribute
    const existingValue =
      await this.attributeValueRepository.findByAttributeIdAndValueCode(
        createAttributeValueDto.attributeId,
        createAttributeValueDto.valueCode
      );
    if (existingValue) {
      throw new ConflictException(
        `Attribute value with code ${createAttributeValueDto.valueCode} already exists for this attribute`
      );
    }

    const attributeValue = AttributeValue.create(
      createAttributeValueDto.attributeId,
      createAttributeValueDto.valueCode,
      createAttributeValueDto.label,
      createAttributeValueDto.sortOrder || 0
    );

    const savedAttributeValue = await this.attributeValueRepository.create(
      attributeValue
    );
    return this.mapToResponseDto(savedAttributeValue);
  }

  async update(
    id: number,
    updateAttributeValueDto: UpdateAttributeValueDto
  ): Promise<AttributeValueResponseDto> {
    const existingAttributeValue = await this.attributeValueRepository.findById(
      id
    );
    if (!existingAttributeValue) {
      throw new NotFoundException(`Attribute value with ID ${id} not found`);
    }

    // Check if new value code conflicts with existing values for the same attribute
    if (
      updateAttributeValueDto.valueCode &&
      updateAttributeValueDto.valueCode !== existingAttributeValue.valueCode
    ) {
      const valueExists =
        await this.attributeValueRepository.existsByAttributeIdAndValueCode(
          existingAttributeValue.attributeId,
          updateAttributeValueDto.valueCode,
          id
        );
      if (valueExists) {
        throw new ConflictException(
          `Attribute value with code ${updateAttributeValueDto.valueCode} already exists for this attribute`
        );
      }
    }

    const updatedAttributeValue = existingAttributeValue.update(
      updateAttributeValueDto.valueCode,
      updateAttributeValueDto.label,
      updateAttributeValueDto.sortOrder
    );

    const savedAttributeValue = await this.attributeValueRepository.update(
      updatedAttributeValue
    );
    return this.mapToResponseDto(savedAttributeValue);
  }

  async delete(id: number): Promise<void> {
    const attributeValue = await this.attributeValueRepository.findById(id);
    if (!attributeValue) {
      throw new NotFoundException(`Attribute value with ID ${id} not found`);
    }

    await this.attributeValueRepository.delete(id);
  }

  private mapToResponseDto(
    attributeValue: AttributeValue
  ): AttributeValueResponseDto {
    return new AttributeValueResponseDto(
      attributeValue.id,
      attributeValue.attributeId,
      attributeValue.valueCode,
      attributeValue.label,
      attributeValue.sortOrder
    );
  }
}
