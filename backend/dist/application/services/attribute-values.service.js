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
exports.AttributeValuesService = void 0;
const common_1 = require("@nestjs/common");
const attribute_value_entity_1 = require("../../domain/entities/attribute-value.entity");
const attribute_value_response_dto_1 = require("../dto/attribute-value-response.dto");
let AttributeValuesService = class AttributeValuesService {
    constructor(attributeValueRepository, attributeRepository) {
        this.attributeValueRepository = attributeValueRepository;
        this.attributeRepository = attributeRepository;
    }
    async findAll() {
        const attributeValues = await this.attributeValueRepository.findAll();
        return attributeValues.map((value) => this.mapToResponseDto(value));
    }
    async findById(id) {
        const attributeValue = await this.attributeValueRepository.findById(id);
        if (!attributeValue) {
            throw new common_1.NotFoundException(`Attribute value with ID ${id} not found`);
        }
        return this.mapToResponseDto(attributeValue);
    }
    async findByAttributeId(attributeId) {
        const attribute = await this.attributeRepository.findById(attributeId);
        if (!attribute) {
            throw new common_1.NotFoundException(`Attribute with ID ${attributeId} not found`);
        }
        const attributeValues = await this.attributeValueRepository.findByAttributeId(attributeId);
        return attributeValues.map((value) => this.mapToResponseDto(value));
    }
    async create(createAttributeValueDto) {
        const attribute = await this.attributeRepository.findById(createAttributeValueDto.attributeId);
        if (!attribute) {
            throw new common_1.NotFoundException(`Attribute with ID ${createAttributeValueDto.attributeId} not found`);
        }
        const existingValue = await this.attributeValueRepository.findByAttributeIdAndValueCode(createAttributeValueDto.attributeId, createAttributeValueDto.valueCode);
        if (existingValue) {
            throw new common_1.ConflictException(`Attribute value with code ${createAttributeValueDto.valueCode} already exists for this attribute`);
        }
        const attributeValue = attribute_value_entity_1.AttributeValue.create(createAttributeValueDto.attributeId, createAttributeValueDto.valueCode, createAttributeValueDto.label, createAttributeValueDto.sortOrder || 0);
        const savedAttributeValue = await this.attributeValueRepository.create(attributeValue);
        return this.mapToResponseDto(savedAttributeValue);
    }
    async update(id, updateAttributeValueDto) {
        const existingAttributeValue = await this.attributeValueRepository.findById(id);
        if (!existingAttributeValue) {
            throw new common_1.NotFoundException(`Attribute value with ID ${id} not found`);
        }
        if (updateAttributeValueDto.valueCode &&
            updateAttributeValueDto.valueCode !== existingAttributeValue.valueCode) {
            const valueExists = await this.attributeValueRepository.existsByAttributeIdAndValueCode(existingAttributeValue.attributeId, updateAttributeValueDto.valueCode, id);
            if (valueExists) {
                throw new common_1.ConflictException(`Attribute value with code ${updateAttributeValueDto.valueCode} already exists for this attribute`);
            }
        }
        const updatedAttributeValue = existingAttributeValue.update(updateAttributeValueDto.valueCode, updateAttributeValueDto.label, updateAttributeValueDto.sortOrder);
        const savedAttributeValue = await this.attributeValueRepository.update(updatedAttributeValue);
        return this.mapToResponseDto(savedAttributeValue);
    }
    async delete(id) {
        const attributeValue = await this.attributeValueRepository.findById(id);
        if (!attributeValue) {
            throw new common_1.NotFoundException(`Attribute value with ID ${id} not found`);
        }
        await this.attributeValueRepository.delete(id);
    }
    mapToResponseDto(attributeValue) {
        return new attribute_value_response_dto_1.AttributeValueResponseDto(attributeValue.id, attributeValue.attributeId, attributeValue.valueCode, attributeValue.label, attributeValue.sortOrder);
    }
};
exports.AttributeValuesService = AttributeValuesService;
exports.AttributeValuesService = AttributeValuesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("AttributeValueRepository")),
    __param(1, (0, common_1.Inject)("AttributeRepository")),
    __metadata("design:paramtypes", [Object, Object])
], AttributeValuesService);
//# sourceMappingURL=attribute-values.service.js.map