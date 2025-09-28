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
exports.ProductAttributeValuesController = void 0;
const common_1 = require("@nestjs/common");
const create_product_attribute_value_dto_1 = require("../../application/dto/create-product-attribute-value.dto");
const update_product_attribute_value_dto_1 = require("../../application/dto/update-product-attribute-value.dto");
const product_attribute_values_service_1 = require("../../application/services/product-attribute-values.service");
let ProductAttributeValuesController = class ProductAttributeValuesController {
    constructor(productAttributeValuesService) {
        this.productAttributeValuesService = productAttributeValuesService;
    }
    create(createProductAttributeValueDto) {
        return this.productAttributeValuesService.create(createProductAttributeValueDto);
    }
    findAll() {
        return this.productAttributeValuesService.findAll();
    }
    findOne(id) {
        return this.productAttributeValuesService.findOne(id);
    }
    findByProductId(productId) {
        return this.productAttributeValuesService.findByProductId(productId);
    }
    findByAttributeId(attributeId) {
        return this.productAttributeValuesService.findByAttributeId(attributeId);
    }
    findByProductAndAttribute(productId, attributeId) {
        return this.productAttributeValuesService.findByProductAndAttribute(productId, attributeId);
    }
    update(id, updateProductAttributeValueDto) {
        return this.productAttributeValuesService.update(id, updateProductAttributeValueDto);
    }
    remove(id) {
        return this.productAttributeValuesService.remove(id);
    }
    removeByProductId(productId) {
        return this.productAttributeValuesService.removeByProductId(productId);
    }
    removeByProductAndAttribute(productId, attributeId) {
        return this.productAttributeValuesService.removeByProductAndAttribute(productId, attributeId);
    }
};
exports.ProductAttributeValuesController = ProductAttributeValuesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_product_attribute_value_dto_1.CreateProductAttributeValueDto !== "undefined" && create_product_attribute_value_dto_1.CreateProductAttributeValueDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)("product/:productId"),
    __param(0, (0, common_1.Param)("productId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "findByProductId", null);
__decorate([
    (0, common_1.Get)("attribute/:attributeId"),
    __param(0, (0, common_1.Param)("attributeId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "findByAttributeId", null);
__decorate([
    (0, common_1.Get)("product/:productId/attribute/:attributeId"),
    __param(0, (0, common_1.Param)("productId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)("attributeId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "findByProductAndAttribute", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof update_product_attribute_value_dto_1.UpdateProductAttributeValueDto !== "undefined" && update_product_attribute_value_dto_1.UpdateProductAttributeValueDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)("product/:productId"),
    __param(0, (0, common_1.Param)("productId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "removeByProductId", null);
__decorate([
    (0, common_1.Delete)("product/:productId/attribute/:attributeId"),
    __param(0, (0, common_1.Param)("productId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)("attributeId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ProductAttributeValuesController.prototype, "removeByProductAndAttribute", null);
exports.ProductAttributeValuesController = ProductAttributeValuesController = __decorate([
    (0, common_1.Controller)("product-attribute-values"),
    __metadata("design:paramtypes", [typeof (_a = typeof product_attribute_values_service_1.ProductAttributeValuesService !== "undefined" && product_attribute_values_service_1.ProductAttributeValuesService) === "function" ? _a : Object])
], ProductAttributeValuesController);
//# sourceMappingURL=product-attribute-values.controller.js.map