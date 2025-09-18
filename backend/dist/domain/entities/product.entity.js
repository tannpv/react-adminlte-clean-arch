"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
class Product {
    constructor(props) {
        this.props = props;
    }
    get id() { return this.props.id; }
    get sku() { return this.props.sku; }
    set sku(value) { this.props.sku = value; }
    get name() { return this.props.name; }
    set name(value) { this.props.name = value; }
    get description() { return this.props.description ?? null; }
    set description(value) { this.props.description = value ?? null; }
    get priceCents() { return this.props.priceCents; }
    set priceCents(value) { this.props.priceCents = value; }
    get currency() { return this.props.currency; }
    set currency(value) { this.props.currency = value; }
    get status() { return this.props.status; }
    set status(value) { this.props.status = value; }
    get metadata() { return this.props.metadata ?? null; }
    set metadata(value) { this.props.metadata = value ?? null; }
    get createdAt() { return this.props.createdAt; }
    set createdAt(value) { this.props.createdAt = value; }
    get updatedAt() { return this.props.updatedAt; }
    set updatedAt(value) { this.props.updatedAt = value; }
    clone() {
        return new Product({ ...this.props, metadata: this.props.metadata ? { ...this.props.metadata } : null });
    }
}
exports.Product = Product;
//# sourceMappingURL=product.entity.js.map