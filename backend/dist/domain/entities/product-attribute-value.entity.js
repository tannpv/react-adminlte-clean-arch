"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductAttributeValue = void 0;
class ProductAttributeValue {
    constructor(id, productId, attributeId, valueText, valueNumber, valueBoolean, createdAt, updatedAt) {
        this.id = id;
        this.productId = productId;
        this.attributeId = attributeId;
        this.valueText = valueText;
        this.valueNumber = valueNumber;
        this.valueBoolean = valueBoolean;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(productId, attributeId, valueText, valueNumber, valueBoolean) {
        const now = new Date();
        return new ProductAttributeValue(0, productId, attributeId, valueText || null, valueNumber || null, valueBoolean || null, now, now);
    }
    update(valueText, valueNumber, valueBoolean) {
        return new ProductAttributeValue(this.id, this.productId, this.attributeId, valueText !== undefined ? valueText : this.valueText, valueNumber !== undefined ? valueNumber : this.valueNumber, valueBoolean !== undefined ? valueBoolean : this.valueBoolean, this.createdAt, new Date());
    }
    getValue() {
        if (this.valueText !== null)
            return this.valueText;
        if (this.valueNumber !== null)
            return this.valueNumber;
        if (this.valueBoolean !== null)
            return this.valueBoolean;
        return null;
    }
    hasValue() {
        return (this.valueText !== null ||
            this.valueNumber !== null ||
            this.valueBoolean !== null);
    }
}
exports.ProductAttributeValue = ProductAttributeValue;
//# sourceMappingURL=product-attribute-value.entity.js.map