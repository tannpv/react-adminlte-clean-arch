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
exports.AttributesService = void 0;
const common_1 = require("@nestjs/common");
const attribute_entity_1 = require("../../domain/entities/attribute.entity");
const attribute_response_dto_1 = require("../dto/attribute-response.dto");
let AttributesService = class AttributesService {
    constructor(attributeRepository) {
        this.attributeRepository = attributeRepository;
    }
    async findAll() {
        const attributes = await this.attributeRepository.findAll();
        return attributes.map((attribute) => this.mapToResponseDto(attribute));
    }
    async findById(id) {
        const attribute = await this.attributeRepository.findById(id);
        if (!attribute) {
            throw new common_1.NotFoundException(`Attribute with ID ${id} not found`);
        }
        return this.mapToResponseDto(attribute);
    }
    async findByCode(code) {
        const attribute = await this.attributeRepository.findByCode(code);
        if (!attribute) {
            throw new common_1.NotFoundException(`Attribute with code ${code} not found`);
        }
        return this.mapToResponseDto(attribute);
    }
    async create(createAttributeDto) {
        const existingAttribute = await this.attributeRepository.findByCode(createAttributeDto.code);
        if (existingAttribute) {
            throw new common_1.ConflictException(`Attribute with code ${createAttributeDto.code} already exists`);
        }
        const attribute = attribute_entity_1.Attribute.create(createAttributeDto.code, createAttributeDto.name, createAttributeDto.inputType, createAttributeDto.dataType, createAttributeDto.unit);
        const savedAttribute = await this.attributeRepository.create(attribute);
        return this.mapToResponseDto(savedAttribute);
    }
    async update(id, updateAttributeDto) {
        const existingAttribute = await this.attributeRepository.findById(id);
        if (!existingAttribute) {
            throw new common_1.NotFoundException(`Attribute with ID ${id} not found`);
        }
        if (updateAttributeDto.code &&
            updateAttributeDto.code !== existingAttribute.code) {
            const codeExists = await this.attributeRepository.existsByCode(updateAttributeDto.code, id);
            if (codeExists) {
                throw new common_1.ConflictException(`Attribute with code ${updateAttributeDto.code} already exists`);
            }
        }
        const updatedAttribute = existingAttribute.update(updateAttributeDto.code, updateAttributeDto.name, updateAttributeDto.inputType, updateAttributeDto.dataType, updateAttributeDto.unit);
        const savedAttribute = await this.attributeRepository.update(updatedAttribute);
        return this.mapToResponseDto(savedAttribute);
    }
    async delete(id) {
        const attribute = await this.attributeRepository.findById(id);
        if (!attribute) {
            throw new common_1.NotFoundException(`Attribute with ID ${id} not found`);
        }
        await this.attributeRepository.delete(id);
    }
    mapToResponseDto(attribute) {
        return new attribute_response_dto_1.AttributeResponseDto(attribute.id, attribute.code, attribute.name, attribute.inputType, attribute.dataType, attribute.unit, attribute.createdAt, attribute.updatedAt);
    }
};
exports.AttributesService = AttributesService;
exports.AttributesService = AttributesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("AttributeRepository")),
    __metadata("design:paramtypes", [Object])
], AttributesService);
//# sourceMappingURL=attributes.service.js.map