"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeSetResponseDto = void 0;
class AttributeSetResponseDto {
    constructor(id, name, description, isSystem, sortOrder, createdAt, updatedAt, attributes = []) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isSystem = isSystem;
        this.sortOrder = sortOrder;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.attributes = attributes;
    }
}
exports.AttributeSetResponseDto = AttributeSetResponseDto;
//# sourceMappingURL=attribute-set-response.dto.js.map