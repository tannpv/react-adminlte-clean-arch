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
exports.AttributeSetsController = void 0;
const common_1 = require("@nestjs/common");
const create_attribute_set_dto_1 = require("../../../application/dto/create-attribute-set.dto");
const update_attribute_set_dto_1 = require("../../../application/dto/update-attribute-set.dto");
const attribute_sets_service_1 = require("../../../application/services/attribute-sets.service");
let AttributeSetsController = class AttributeSetsController {
    constructor(attributeSetsService) {
        this.attributeSetsService = attributeSetsService;
    }
    async findAll() {
        return this.attributeSetsService.findAll();
    }
    async findByName(name) {
        return this.attributeSetsService.findByName(name);
    }
    async findById(id) {
        return this.attributeSetsService.findById(id);
    }
    async create(createAttributeSetDto) {
        return this.attributeSetsService.create(createAttributeSetDto);
    }
    async update(id, updateAttributeSetDto) {
        return this.attributeSetsService.update(id, updateAttributeSetDto);
    }
    async delete(id) {
        return this.attributeSetsService.delete(id);
    }
    async addAttributeToSet(attributeSetId, attributeId, body) {
        return this.attributeSetsService.addAttributeToSet(attributeSetId, attributeId, body.sortOrder, body.isRequired);
    }
    async removeAttributeFromSet(attributeSetId, attributeId) {
        return this.attributeSetsService.removeAttributeFromSet(attributeSetId, attributeId);
    }
};
exports.AttributeSetsController = AttributeSetsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttributeSetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("by-name/:name"),
    __param(0, (0, common_1.Param)("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttributeSetsController.prototype, "findByName", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttributeSetsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attribute_set_dto_1.CreateAttributeSetDto]),
    __metadata("design:returntype", Promise)
], AttributeSetsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_attribute_set_dto_1.UpdateAttributeSetDto]),
    __metadata("design:returntype", Promise)
], AttributeSetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttributeSetsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(":id/attributes/:attributeId"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)("attributeId", common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], AttributeSetsController.prototype, "addAttributeToSet", null);
__decorate([
    (0, common_1.Delete)(":id/attributes/:attributeId"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)("attributeId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AttributeSetsController.prototype, "removeAttributeFromSet", null);
exports.AttributeSetsController = AttributeSetsController = __decorate([
    (0, common_1.Controller)("attribute-sets"),
    __metadata("design:paramtypes", [attribute_sets_service_1.AttributeSetsService])
], AttributeSetsController);
//# sourceMappingURL=attribute-sets.controller.js.map