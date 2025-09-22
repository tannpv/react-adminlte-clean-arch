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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantsController = void 0;
const common_1 = require("@nestjs/common");
const product_variants_service_1 = require("../../application/services/product-variants.service");
const create_product_variant_dto_1 = require("../../application/dto/create-product-variant.dto");
const update_product_variant_dto_1 = require("../../application/dto/update-product-variant.dto");
let ProductVariantsController = class ProductVariantsController {
    constructor(productVariantsService) {
        this.productVariantsService = productVariantsService;
    }
    create(createProductVariantDto) {
        return this.productVariantsService.create(createProductVariantDto);
    }
    findAll() {
        return this.productVariantsService.findAll();
    }
    findByProductId(productId) {
        return this.productVariantsService.findByProductId(productId);
    }
    findBySku(sku) {
        return this.productVariantsService.findBySku(sku);
    }
    findOne(id) {
        return this.productVariantsService.findOne(id);
    }
    update(id, updateProductVariantDto) {
        return this.productVariantsService.update(id, updateProductVariantDto);
    }
    remove(id) {
        return this.productVariantsService.remove(id);
    }
    removeByProductId(productId) {
        return this.productVariantsService.removeByProductId(productId);
    }
};
exports.ProductVariantsController = ProductVariantsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_product_variant_dto_1.CreateProductVariantDto !== "undefined" && create_product_variant_dto_1.CreateProductVariantDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "findByProductId", null);
__decorate([
    (0, common_1.Get)('sku/:sku'),
    __param(0, (0, common_1.Param)('sku')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "findBySku", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof update_product_variant_dto_1.UpdateProductVariantDto !== "undefined" && update_product_variant_dto_1.UpdateProductVariantDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('product/:productId'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductVariantsController.prototype, "removeByProductId", null);
exports.ProductVariantsController = ProductVariantsController = __decorate([
    (0, common_1.Controller)('product-variants'),
    __metadata("design:paramtypes", [typeof (_a = typeof product_variants_service_1.ProductVariantsService !== "undefined" && product_variants_service_1.ProductVariantsService) === "function" ? _a : Object])
], ProductVariantsController);
//# sourceMappingURL=product-variants.controller.js.map