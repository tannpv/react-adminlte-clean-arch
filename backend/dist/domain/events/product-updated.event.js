"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductUpdatedEvent = void 0;
const domain_event_1 = require("./domain-event");
class ProductUpdatedEvent extends domain_event_1.DomainEvent {
    constructor(product) {
        super();
        this.product = product;
        this.name = ProductUpdatedEvent.eventName;
    }
}
exports.ProductUpdatedEvent = ProductUpdatedEvent;
ProductUpdatedEvent.eventName = 'product.updated';
//# sourceMappingURL=product-updated.event.js.map