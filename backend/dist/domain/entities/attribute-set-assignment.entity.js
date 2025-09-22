"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeSetAssignment = void 0;
class AttributeSetAssignment {
    constructor(id, attributeSetId, attributeId, sortOrder, isRequired, createdAt, updatedAt) {
        this.id = id;
        this.attributeSetId = attributeSetId;
        this.attributeId = attributeId;
        this.sortOrder = sortOrder;
        this.isRequired = isRequired;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(attributeSetId, attributeId, sortOrder = 0, isRequired = false) {
        const now = new Date();
        return new AttributeSetAssignment(0, attributeSetId, attributeId, sortOrder, isRequired, now, now);
    }
    update(sortOrder, isRequired) {
        return new AttributeSetAssignment(this.id, this.attributeSetId, this.attributeId, sortOrder ?? this.sortOrder, isRequired ?? this.isRequired, this.createdAt, new Date());
    }
}
exports.AttributeSetAssignment = AttributeSetAssignment;
//# sourceMappingURL=attribute-set-assignment.entity.js.map