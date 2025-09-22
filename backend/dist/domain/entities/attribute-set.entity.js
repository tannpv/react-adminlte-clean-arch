"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeSet = void 0;
class AttributeSet {
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
    static create(name, description, isSystem = false, sortOrder = 0) {
        const now = new Date();
        return new AttributeSet(0, name, description || null, isSystem, sortOrder, now, now, []);
    }
    update(name, description, isSystem, sortOrder) {
        return new AttributeSet(this.id, name ?? this.name, description !== undefined ? description : this.description, isSystem ?? this.isSystem, sortOrder ?? this.sortOrder, this.createdAt, new Date(), this.attributes);
    }
    addAttribute(attribute) {
        const updatedAttributes = [...this.attributes, attribute];
        return new AttributeSet(this.id, this.name, this.description, this.isSystem, this.sortOrder, this.createdAt, new Date(), updatedAttributes);
    }
    removeAttribute(attributeId) {
        const updatedAttributes = this.attributes.filter((attr) => attr.id !== attributeId);
        return new AttributeSet(this.id, this.name, this.description, this.isSystem, this.sortOrder, this.createdAt, new Date(), updatedAttributes);
    }
    hasAttribute(attributeId) {
        return this.attributes.some((attr) => attr.id === attributeId);
    }
    getAttributeCount() {
        return this.attributes.length;
    }
}
exports.AttributeSet = AttributeSet;
//# sourceMappingURL=attribute-set.entity.js.map