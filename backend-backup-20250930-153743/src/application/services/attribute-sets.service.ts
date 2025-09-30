import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AttributeSetAssignment } from "../../domain/entities/attribute-set-assignment.entity";
import { AttributeSet } from "../../domain/entities/attribute-set.entity";
import { AttributeSetAssignmentRepository } from "../../domain/repositories/attribute-set-assignment.repository";
import { AttributeSetRepository } from "../../domain/repositories/attribute-set.repository";
import { AttributeRepository } from "../../domain/repositories/attribute.repository";
import { AttributeResponseDto } from "../dto/attribute-response.dto";
import { AttributeSetResponseDto } from "../dto/attribute-set-response.dto";
import { CreateAttributeSetDto } from "../dto/create-attribute-set.dto";
import { UpdateAttributeSetDto } from "../dto/update-attribute-set.dto";

@Injectable()
export class AttributeSetsService {
  constructor(
    @Inject("AttributeSetRepository")
    private readonly attributeSetRepository: AttributeSetRepository,
    @Inject("AttributeSetAssignmentRepository")
    private readonly attributeSetAssignmentRepository: AttributeSetAssignmentRepository,
    @Inject("AttributeRepository")
    private readonly attributeRepository: AttributeRepository
  ) {}

  async findAll(): Promise<AttributeSetResponseDto[]> {
    const attributeSets = await this.attributeSetRepository.findAll();
    const result: AttributeSetResponseDto[] = [];

    for (const attributeSet of attributeSets) {
      const attributes = await this.getAttributesForSet(attributeSet.id);
      result.push(this.mapToResponseDto(attributeSet, attributes));
    }

    return result;
  }

  async findById(id: number): Promise<AttributeSetResponseDto> {
    const attributeSet = await this.attributeSetRepository.findById(id);
    if (!attributeSet) {
      throw new NotFoundException(`Attribute set with ID ${id} not found`);
    }

    const attributes = await this.getAttributesForSet(id);
    return this.mapToResponseDto(attributeSet, attributes);
  }

  async findByName(name: string): Promise<AttributeSetResponseDto> {
    const attributeSet = await this.attributeSetRepository.findByName(name);
    if (!attributeSet) {
      throw new NotFoundException(`Attribute set with name ${name} not found`);
    }

    const attributes = await this.getAttributesForSet(attributeSet.id);
    return this.mapToResponseDto(attributeSet, attributes);
  }

  async create(
    createAttributeSetDto: CreateAttributeSetDto
  ): Promise<AttributeSetResponseDto> {
    // Check if attribute set name already exists
    const existingAttributeSet = await this.attributeSetRepository.findByName(
      createAttributeSetDto.name
    );
    if (existingAttributeSet) {
      throw new ConflictException(
        `Attribute set with name ${createAttributeSetDto.name} already exists`
      );
    }

    const attributeSet = AttributeSet.create(
      createAttributeSetDto.name,
      createAttributeSetDto.description,
      false, // isSystem
      0 // sortOrder
    );

    const savedAttributeSet = await this.attributeSetRepository.create(
      attributeSet
    );
    return this.mapToResponseDto(savedAttributeSet, []);
  }

  async update(
    id: number,
    updateAttributeSetDto: UpdateAttributeSetDto
  ): Promise<AttributeSetResponseDto> {
    const existingAttributeSet = await this.attributeSetRepository.findById(id);
    if (!existingAttributeSet) {
      throw new NotFoundException(`Attribute set with ID ${id} not found`);
    }

    // Check if new name conflicts with existing attribute sets
    if (
      updateAttributeSetDto.name &&
      updateAttributeSetDto.name !== existingAttributeSet.name
    ) {
      const nameExists = await this.attributeSetRepository.existsByName(
        updateAttributeSetDto.name,
        id
      );
      if (nameExists) {
        throw new ConflictException(
          `Attribute set with name ${updateAttributeSetDto.name} already exists`
        );
      }
    }

    const updatedAttributeSet = existingAttributeSet.update(
      updateAttributeSetDto.name,
      updateAttributeSetDto.description
    );

    const savedAttributeSet = await this.attributeSetRepository.update(
      updatedAttributeSet
    );
    const attributes = await this.getAttributesForSet(id);
    return this.mapToResponseDto(savedAttributeSet, attributes);
  }

  async delete(id: number): Promise<void> {
    const attributeSet = await this.attributeSetRepository.findById(id);
    if (!attributeSet) {
      throw new NotFoundException(`Attribute set with ID ${id} not found`);
    }

    if (attributeSet.isSystem) {
      throw new ConflictException("Cannot delete system attribute sets");
    }

    // Delete all assignments first
    await this.attributeSetAssignmentRepository.deleteByAttributeSetId(id);

    // Delete the attribute set
    await this.attributeSetRepository.delete(id);
  }

  async addAttributeToSet(
    attributeSetId: number,
    attributeId: number,
    sortOrder?: number,
    isRequired?: boolean
  ): Promise<void> {
    // Verify attribute set exists
    const attributeSet = await this.attributeSetRepository.findById(
      attributeSetId
    );
    if (!attributeSet) {
      throw new NotFoundException(
        `Attribute set with ID ${attributeSetId} not found`
      );
    }

    // Verify attribute exists
    const attribute = await this.attributeRepository.findById(attributeId);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment =
      await this.attributeSetAssignmentRepository.findByAttributeSetIdAndAttributeId(
        attributeSetId,
        attributeId
      );
    if (existingAssignment) {
      throw new ConflictException(
        "Attribute is already assigned to this attribute set"
      );
    }

    const assignment = AttributeSetAssignment.create(
      attributeSetId,
      attributeId,
      sortOrder || 0,
      isRequired || false
    );

    await this.attributeSetAssignmentRepository.create(assignment);
  }

  async removeAttributeFromSet(
    attributeSetId: number,
    attributeId: number
  ): Promise<void> {
    const assignment =
      await this.attributeSetAssignmentRepository.findByAttributeSetIdAndAttributeId(
        attributeSetId,
        attributeId
      );
    if (!assignment) {
      throw new NotFoundException(
        "Attribute is not assigned to this attribute set"
      );
    }

    await this.attributeSetAssignmentRepository.delete(assignment.id);
  }

  private async getAttributesForSet(
    attributeSetId: number
  ): Promise<AttributeResponseDto[]> {
    const assignments =
      await this.attributeSetAssignmentRepository.findByAttributeSetId(
        attributeSetId
      );
    const attributes: AttributeResponseDto[] = [];

    for (const assignment of assignments) {
      const attribute = await this.attributeRepository.findById(
        assignment.attributeId
      );
      if (attribute) {
        attributes.push(
          new AttributeResponseDto(
            attribute.id,
            attribute.code,
            attribute.name,
            attribute.inputType,
            attribute.dataType,
            attribute.unit,
            attribute.createdAt,
            attribute.updatedAt
          )
        );
      }
    }

    return attributes;
  }

  private mapToResponseDto(
    attributeSet: AttributeSet,
    attributes: AttributeResponseDto[]
  ): AttributeSetResponseDto {
    return new AttributeSetResponseDto(
      attributeSet.id,
      attributeSet.name,
      attributeSet.description,
      attributeSet.isSystem,
      attributeSet.sortOrder,
      attributeSet.createdAt,
      attributeSet.updatedAt,
      attributes
    );
  }
}
