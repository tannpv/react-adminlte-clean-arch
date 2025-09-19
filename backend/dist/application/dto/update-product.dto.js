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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const statuses = ['draft', 'published', 'archived'];
class UpdateProductDto {
}
exports.UpdateProductDto = UpdateProductDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'SKU must be text' }),
    (0, class_validator_1.MinLength)(2, { message: 'SKU must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(64, { message: 'SKU must be at most 64 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "sku", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Name must be text' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Name must be at most 255 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be text' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? Number(value) : value)),
    (0, class_validator_1.IsNumber)({ allowNaN: false, allowInfinity: false }, { message: 'Price must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'Price must be positive' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Currency must be text' }),
    (0, class_validator_1.MinLength)(3, { message: 'Currency must be 3 characters' }),
    (0, class_validator_1.MaxLength)(8, { message: 'Currency must be at most 8 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value)),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(statuses, { message: 'Invalid status provided' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Categories must be an array' }),
    (0, class_validator_1.ArrayUnique)({ message: 'Categories must be unique' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null)
            return value;
        const array = Array.isArray(value) ? value : [value];
        const numbers = array
            .map((entry) => {
            const num = Number(entry);
            return Number.isFinite(num) ? num : null;
        })
            .filter((num) => num !== null);
        return numbers;
    }),
    __metadata("design:type", Array)
], UpdateProductDto.prototype, "categories", void 0);
//# sourceMappingURL=update-product.dto.js.map