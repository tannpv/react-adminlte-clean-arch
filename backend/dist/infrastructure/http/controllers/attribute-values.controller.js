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
exports.AttributeValuesController = void 0;
const common_1 = require("@nestjs/common");
const create_attribute_value_dto_1 = require("../../../application/dto/create-attribute-value.dto");
const update_attribute_value_dto_1 = require("../../../application/dto/update-attribute-value.dto");
const attribute_values_service_1 = require("../../../application/services/attribute-values.service");
let AttributeValuesController = class AttributeValuesController {
    constructor(attributeValuesService) {
        this.attributeValuesService = attributeValuesService;
    }
    async findAll() {
        return this.attributeValuesService.findAll();
    }
    async findByAttributeId(attributeId) {
        return this.attributeValuesService.findByAttributeId(attributeId);
    }
    async findById(id) {
        return this.attributeValuesService.findById(id);
    }
    async create(createAttributeValueDto) {
        return this.attributeValuesService.create(createAttributeValueDto);
    }
    async update(id, updateAttributeValueDto) {
        return this.attributeValuesService.update(id, updateAttributeValueDto);
    }
    async delete(id) {
        return this.attributeValuesService.delete(id);
    }
};
exports.AttributeValuesController = AttributeValuesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("by-attribute/:attributeId"),
    __param(0, (0, common_1.Param)("attributeId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "findByAttributeId", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attribute_value_dto_1.CreateAttributeValueDto]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_attribute_value_dto_1.UpdateAttributeValueDto]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttributeValuesController.prototype, "delete", null);
exports.AttributeValuesController = AttributeValuesController = __decorate([
    (0, common_1.Controller)("attribute-values"),
    __metadata("design:paramtypes", [attribute_values_service_1.AttributeValuesService])
], AttributeValuesController);
//# sourceMappingURL=attribute-values.controller.js.map