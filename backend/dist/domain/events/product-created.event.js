"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCreatedEvent = void 0;
const domain_event_1 = require("./domain-event");
class ProductCreatedEvent extends domain_event_1.DomainEvent {
    constructor(product) {
        super();
        this.product = product;
        this.name = ProductCreatedEvent.eventName;
    }
}
exports.ProductCreatedEvent = ProductCreatedEvent;
ProductCreatedEvent.eventName = 'product.created';
//# sourceMappingURL=product-created.event.js.map