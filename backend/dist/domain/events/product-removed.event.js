"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRemovedEvent = void 0;
const domain_event_1 = require("./domain-event");
class ProductRemovedEvent extends domain_event_1.DomainEvent {
    constructor(product) {
        super();
        this.product = product;
        this.name = ProductRemovedEvent.eventName;
    }
}
exports.ProductRemovedEvent = ProductRemovedEvent;
ProductRemovedEvent.eventName = 'product.removed';
//# sourceMappingURL=product-removed.event.js.map