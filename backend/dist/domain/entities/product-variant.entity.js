"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariant = void 0;
class ProductVariant {
    constructor(id, productId, sku, name, priceCents, currency, status, createdAt, updatedAt) {
        this.id = id;
        this.productId = productId;
        this.sku = sku;
        this.name = name;
        this.priceCents = priceCents;
        this.currency = currency;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(productId, sku, name, priceCents, currency = "USD", status = "active") {
        const now = new Date();
        return new ProductVariant(0, productId, sku, name, priceCents, currency, status, now, now);
    }
    update(sku, name, priceCents, currency, status) {
        return new ProductVariant(this.id, this.productId, sku ?? this.sku, name ?? this.name, priceCents ?? this.priceCents, currency ?? this.currency, status ?? this.status, this.createdAt, new Date());
    }
    getPrice() {
        return this.priceCents / 100;
    }
    setPrice(price) {
        return this.update(undefined, undefined, Math.round(price * 100));
    }
    isActive() {
        return this.status === "active";
    }
    activate() {
        return this.update(undefined, undefined, undefined, undefined, "active");
    }
    deactivate() {
        return this.update(undefined, undefined, undefined, undefined, "inactive");
    }
}
exports.ProductVariant = ProductVariant;
//# sourceMappingURL=product-variant.entity.js.map