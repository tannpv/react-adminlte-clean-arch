"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toProductResponse = toProductResponse;
function toProductResponse(product) {
    return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description ?? null,
        priceCents: product.priceCents,
        currency: product.currency,
        status: product.status,
        metadata: product.metadata ? { ...product.metadata } : null,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=product.mapper.js.map