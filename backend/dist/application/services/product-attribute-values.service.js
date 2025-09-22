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
exports.ProductAttributeValuesService = void 0;
const common_1 = require("@nestjs/common");
const product_attribute_value_entity_1 = require("../../domain/entities/product-attribute-value.entity");
let ProductAttributeValuesService = class ProductAttributeValuesService {
    constructor(productAttributeValueRepository) {
        this.productAttributeValueRepository = productAttributeValueRepository;
    }
    async create(createDto) {
        const productAttributeValue = product_attribute_value_entity_1.ProductAttributeValue.create(createDto.productId, createDto.attributeId, createDto.valueText, createDto.valueNumber, createDto.valueBoolean);
        return await this.productAttributeValueRepository.save(productAttributeValue);
    }
    async findAll() {
        return [];
    }
    async findByProductId(productId) {
        return await this.productAttributeValueRepository.findByProductId(productId);
    }
    async findByAttributeId(attributeId) {
        return await this.productAttributeValueRepository.findByAttributeId(attributeId);
    }
    async findOne(id) {
        return await this.productAttributeValueRepository.findById(id);
    }
    async findByProductAndAttribute(productId, attributeId) {
        return await this.productAttributeValueRepository.findByProductAndAttribute(productId, attributeId);
    }
    async update(id, updateDto) {
        const existing = await this.productAttributeValueRepository.findById(id);
        if (!existing) {
            throw new Error("Product attribute value not found");
        }
        const updated = existing.update(updateDto.valueText, updateDto.valueNumber, updateDto.valueBoolean);
        return await this.productAttributeValueRepository.update(id, updated);
    }
    async remove(id) {
        const existing = await this.productAttributeValueRepository.findById(id);
        if (!existing) {
            throw new Error("Product attribute value not found");
        }
        await this.productAttributeValueRepository.delete(id);
    }
    async removeByProductId(productId) {
        await this.productAttributeValueRepository.deleteByProductId(productId);
    }
    async removeByProductAndAttribute(productId, attributeId) {
        await this.productAttributeValueRepository.deleteByProductAndAttribute(productId, attributeId);
    }
};
exports.ProductAttributeValuesService = ProductAttributeValuesService;
exports.ProductAttributeValuesService = ProductAttributeValuesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("ProductAttributeValueRepository")),
    __metadata("design:paramtypes", [Object])
], ProductAttributeValuesService);
//# sourceMappingURL=product-attribute-values.service.js.map