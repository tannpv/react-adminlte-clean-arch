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
exports.ProductVariantsService = void 0;
const common_1 = require("@nestjs/common");
const product_variant_entity_1 = require("../../domain/entities/product-variant.entity");
let ProductVariantsService = class ProductVariantsService {
    constructor(productVariantRepository) {
        this.productVariantRepository = productVariantRepository;
    }
    async create(createDto) {
        const existingVariant = await this.productVariantRepository.findBySku(createDto.sku);
        if (existingVariant) {
            throw new Error('Variant with this SKU already exists');
        }
        const productVariant = product_variant_entity_1.ProductVariant.create(createDto.productId, createDto.sku, createDto.name, createDto.priceCents, createDto.currency || 'USD', createDto.status || 'active');
        return await this.productVariantRepository.save(productVariant);
    }
    async findAll() {
        return [];
    }
    async findByProductId(productId) {
        return await this.productVariantRepository.findByProductId(productId);
    }
    async findOne(id) {
        return await this.productVariantRepository.findById(id);
    }
    async findBySku(sku) {
        return await this.productVariantRepository.findBySku(sku);
    }
    async update(id, updateDto) {
        const existing = await this.productVariantRepository.findById(id);
        if (!existing) {
            throw new Error('Product variant not found');
        }
        if (updateDto.sku && updateDto.sku !== existing.sku) {
            const existingVariant = await this.productVariantRepository.findBySku(updateDto.sku);
            if (existingVariant) {
                throw new Error('Variant with this SKU already exists');
            }
        }
        const updated = existing.update(updateDto.sku, updateDto.name, updateDto.priceCents, updateDto.currency, updateDto.status);
        return await this.productVariantRepository.update(id, updated);
    }
    async remove(id) {
        const existing = await this.productVariantRepository.findById(id);
        if (!existing) {
            throw new Error('Product variant not found');
        }
        await this.productVariantRepository.delete(id);
    }
    async removeByProductId(productId) {
        await this.productVariantRepository.deleteByProductId(productId);
    }
};
exports.ProductVariantsService = ProductVariantsService;
exports.ProductVariantsService = ProductVariantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ProductVariantRepository')),
    __metadata("design:paramtypes", [Object])
], ProductVariantsService);
//# sourceMappingURL=product-variants.service.js.map