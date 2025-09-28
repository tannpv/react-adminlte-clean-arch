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
exports.UpdateFileGrantsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class GrantInput {
}
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Role id must be number' }),
    (0, class_validator_1.Min)(1, { message: 'Role id must be positive' }),
    __metadata("design:type", Number)
], GrantInput.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['read', 'write'], { message: 'Access must be read or write' }),
    __metadata("design:type", String)
], GrantInput.prototype, "access", void 0);
class UpdateFileGrantsDto {
}
exports.UpdateFileGrantsDto = UpdateFileGrantsDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Grants must be an array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GrantInput),
    __metadata("design:type", Array)
], UpdateFileGrantsDto.prototype, "grants", void 0);
//# sourceMappingURL=update-file-grants.dto.js.map