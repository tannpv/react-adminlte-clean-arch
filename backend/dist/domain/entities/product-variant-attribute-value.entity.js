"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantAttributeValue = void 0;
class ProductVariantAttributeValue {
    constructor(id, variantId, attributeId, valueText, valueNumber, valueBoolean, createdAt, updatedAt) {
        this.id = id;
        this.variantId = variantId;
        this.attributeId = attributeId;
        this.valueText = valueText;
        this.valueNumber = valueNumber;
        this.valueBoolean = valueBoolean;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(variantId, attributeId, valueText, valueNumber, valueBoolean) {
        const now = new Date();
        return new ProductVariantAttributeValue(0, variantId, attributeId, valueText || null, valueNumber || null, valueBoolean || null, now, now);
    }
    update(valueText, valueNumber, valueBoolean) {
        return new ProductVariantAttributeValue(this.id, this.variantId, this.attributeId, valueText !== undefined ? valueText : this.valueText, valueNumber !== undefined ? valueNumber : this.valueNumber, valueBoolean !== undefined ? valueBoolean : this.valueBoolean, this.createdAt, new Date());
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
        return this.valueText !== null || this.valueNumber !== null || this.valueBoolean !== null;
    }
}
exports.ProductVariantAttributeValue = ProductVariantAttributeValue;
//# sourceMappingURL=product-variant-attribute-value.entity.js.map