"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeSetsService = void 0;
const common_1 = require("@nestjs/common");
const attribute_set_assignment_entity_1 = require("../../domain/entities/attribute-set-assignment.entity");
const attribute_set_entity_1 = require("../../domain/entities/attribute-set.entity");
const attribute_response_dto_1 = require("../dto/attribute-response.dto");
const attribute_set_response_dto_1 = require("../dto/attribute-set-response.dto");
let AttributeSetsService = class AttributeSetsService {
    constructor(attributeSetRepository, attributeSetAssignmentRepository, attributeRepository) {
        this.attributeSetRepository = attributeSetRepository;
        this.attributeSetAssignmentRepository = attributeSetAssignmentRepository;
        this.attributeRepository = attributeRepository;
    }
    async findAll() {
        const attributeSets = await this.attributeSetRepository.findAll();
        const result = [];
        for (const attributeSet of attributeSets) {
            const attributes = await this.getAttributesForSet(attributeSet.id);
            result.push(this.mapToResponseDto(attributeSet, attributes));
        }
        return result;
    }
    async findById(id) {
        const attributeSet = await this.attributeSetRepository.findById(id);
        if (!attributeSet) {
            throw new common_1.NotFoundException(`Attribute set with ID ${id} not found`);
        }
        const attributes = await this.getAttributesForSet(id);
        return this.mapToResponseDto(attributeSet, attributes);
    }
    async findByName(name) {
        const attributeSet = await this.attributeSetRepository.findByName(name);
        if (!attributeSet) {
            throw new common_1.NotFoundException(`Attribute set with name ${name} not found`);
        }
        const attributes = await this.getAttributesForSet(attributeSet.id);
        return this.mapToResponseDto(attributeSet, attributes);
    }
    async create(createAttributeSetDto) {
        const existingAttributeSet = await this.attributeSetRepository.findByName(createAttributeSetDto.name);
        if (existingAttributeSet) {
            throw new common_1.ConflictException(`Attribute set with name ${createAttributeSetDto.name} already exists`);
        }
        const attributeSet = attribute_set_entity_1.AttributeSet.create(createAttributeSetDto.name, createAttributeSetDto.description, false, 0);
        const savedAttributeSet = await this.attributeSetRepository.create(attributeSet);
        return this.mapToResponseDto(savedAttributeSet, []);
    }
    async update(id, updateAttributeSetDto) {
        const existingAttributeSet = await this.attributeSetRepository.findById(id);
        if (!existingAttributeSet) {
            throw new common_1.NotFoundException(`Attribute set with ID ${id} not found`);
        }
        if (updateAttributeSetDto.name &&
            updateAttributeSetDto.name !== existingAttributeSet.name) {
            const nameExists = await this.attributeSetRepository.existsByName(updateAttributeSetDto.name, id);
            if (nameExists) {
                throw new common_1.ConflictException(`Attribute set with name ${updateAttributeSetDto.name} already exists`);
            }
        }
        const updatedAttributeSet = existingAttributeSet.update(updateAttributeSetDto.name, updateAttributeSetDto.description);
        const savedAttributeSet = await this.attributeSetRepository.update(updatedAttributeSet);
        const attributes = await this.getAttributesForSet(id);
        return this.mapToResponseDto(savedAttributeSet, attributes);
    }
    async delete(id) {
        const attributeSet = await this.attributeSetRepository.findById(id);
        if (!attributeSet) {
            throw new common_1.NotFoundException(`Attribute set with ID ${id} not found`);
        }
        if (attributeSet.isSystem) {
            throw new common_1.ConflictException("Cannot delete system attribute sets");
        }
        await this.attributeSetAssignmentRepository.deleteByAttributeSetId(id);
        await this.attributeSetRepository.delete(id);
    }
    async addAttributeToSet(attributeSetId, attributeId, sortOrder, isRequired) {
        const attributeSet = await this.attributeSetRepository.findById(attributeSetId);
        if (!attributeSet) {
            throw new common_1.NotFoundException(`Attribute set with ID ${attributeSetId} not found`);
        }
        const attribute = await this.attributeRepository.findById(attributeId);
        if (!attribute) {
            throw new common_1.NotFoundException(`Attribute with ID ${attributeId} not found`);
        }
        const existingAssignment = await this.attributeSetAssignmentRepository.findByAttributeSetIdAndAttributeId(attributeSetId, attributeId);
        if (existingAssignment) {
            throw new common_1.ConflictException("Attribute is already assigned to this attribute set");
        }
        const assignment = attribute_set_assignment_entity_1.AttributeSetAssignment.create(attributeSetId, attributeId, sortOrder || 0, isRequired || false);
        await this.attributeSetAssignmentRepository.create(assignment);
    }
    async removeAttributeFromSet(attributeSetId, attributeId) {
        const assignment = await this.attributeSetAssignmentRepository.findByAttributeSetIdAndAttributeId(attributeSetId, attributeId);
        if (!assignment) {
            throw new common_1.NotFoundException("Attribute is not assigned to this attribute set");
        }
        await this.attributeSetAssignmentRepository.delete(assignment.id);
    }
    async getAttributesForSet(attributeSetId) {
        const assignments = await this.attributeSetAssignmentRepository.findByAttributeSetId(attributeSetId);
        const attributes = [];
        for (const assignment of assignments) {
            const attribute = await this.attributeRepository.findById(assignment.attributeId);
            if (attribute) {
                attributes.push(new attribute_response_dto_1.AttributeResponseDto(attribute.id, attribute.code, attribute.name, attribute.inputType, attribute.dataType, attribute.unit, attribute.createdAt, attribute.updatedAt));
            }
        }
        return attributes;
    }
    mapToResponseDto(attributeSet, attributes) {
        return new attribute_set_response_dto_1.AttributeSetResponseDto(attributeSet.id, attributeSet.name, attributeSet.description, attributeSet.isSystem, attributeSet.sortOrder, attributeSet.createdAt, attributeSet.updatedAt, attributes);
    }
};
exports.AttributeSetsService = AttributeSetsService;
exports.AttributeSetsService = AttributeSetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("AttributeSetRepository")),
    __param(1, (0, common_1.Inject)("AttributeSetAssignmentRepository")),
    __param(2, (0, common_1.Inject)("AttributeRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], AttributeSetsService);
//# sourceMappingURL=attribute-sets.service.js.map