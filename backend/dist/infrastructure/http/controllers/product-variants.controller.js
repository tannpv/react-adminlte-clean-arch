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
exports.ProductVariantsController = void 0;
const common_1 = require("@nestjs/common");
const create_product_variant_dto_1 = require("../../../application/dto/create-product-variant.dto");
const update_product_variant_dto_1 = require("../../../application/dto/update-product-variant.dto");
const product_variants_service_1 = require("../../../application/services/product-variants.service");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const permissions_guard_1 = require("../guards/permissions.guard");
let ProductVariantsController = class ProductVariantsController {
    constructor(productVariantsService) {
        this.productVariantsService = productVariantsService;
    }
    async findAll(productId) {
        if (productId) {
            return this.productVariantsService.findByProductId(parseInt(productId));
        }
        return this.productVariantsService.findAll();
    }
    async findOne(id) {
        return this.productVariantsService.findOne(id);
    }
    async getVariantAttributeValues(id) {
        return this.productVariantsService.getVariantAttributeValues(id);
    }
    async create(dto) {
        return this.productVariantsService.create(dto);
    }
    async update(id, dto) {
        return this.productVariantsService.update(id, dto);
    }
    async remove(id) {
        return this.productVariantsService.remove(id);
    }
    async setVariantAttributeValues(id, attributeValues) {
        return this.productVariantsService.setVariantAttributeValues(id, attributeValues);
    }
    async generateVariants(productId) {
        return this.productVariantsService.generateVariantsFromAttributes(productId);
    }
};
exports.ProductVariantsController = ProductVariantsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequireAnyPermission)("products:read", "users:read"),
    __param(0, (0, common_1.Query)("productId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductVariantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, permissions_decorator_1.RequireAnyPermission)("products:read", "users:read"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductVariantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(":id/attribute-values"),
    (0, permissions_decorator_1.RequireAnyPermission)("products:read", "users:read"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductVariantsController.prototype, "getVariantAttributeValues", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)("products:create"),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: false, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_variant_dto_1.CreateProductVariantDto]),
    __metadata("design:returntype", Promise)
], ProductVariantsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, permissions_decorator_1.RequirePermissions)("products:update"),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: false, transform: true })),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_variant_dto_1.UpdateProductVariantDto]),
    __metadata("design:returntype", Promise)
], ProductVariantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, permissions_decorator_1.RequirePermissions)("products:delete"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductVariantsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/attribute-values"),
    (0, permissions_decorator_1.RequirePermissions)("products:update"),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: false, transform: true })),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductVariantsController.prototype, "setVariantAttributeValues", null);
__decorate([
    (0, common_1.Get)("product/:productId/generate"),
    (0, permissions_decorator_1.RequirePermissions)("products:create"),
    __param(0, (0, common_1.Param)("productId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductVariantsController.prototype, "generateVariants", null);
exports.ProductVariantsController = ProductVariantsController = __decorate([
    (0, common_1.Controller)("product-variants"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [product_variants_service_1.ProductVariantsService])
], ProductVariantsController);
//# sourceMappingURL=product-variants.controller.js.map