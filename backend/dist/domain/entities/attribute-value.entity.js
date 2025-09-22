"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeValue = void 0;
class AttributeValue {
    constructor(id, attributeId, valueCode, label, sortOrder) {
        this.id = id;
        this.attributeId = attributeId;
        this.valueCode = valueCode;
        this.label = label;
        this.sortOrder = sortOrder;
    }
    static create(attributeId, valueCode, label, sortOrder = 0) {
        return new AttributeValue(0, attributeId, valueCode, label, sortOrder);
    }
    update(valueCode, label, sortOrder) {
        return new AttributeValue(this.id, this.attributeId, valueCode ?? this.valueCode, label ?? this.label, sortOrder ?? this.sortOrder);
    }
}
exports.AttributeValue = AttributeValue;
//# sourceMappingURL=attribute-value.entity.js.map