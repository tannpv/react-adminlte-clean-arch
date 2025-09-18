"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleUpdatedEvent = void 0;
const domain_event_1 = require("./domain-event");
class RoleUpdatedEvent extends domain_event_1.DomainEvent {
    constructor(role) {
        super();
        this.role = role;
        this.name = RoleUpdatedEvent.eventName;
    }
}
exports.RoleUpdatedEvent = RoleUpdatedEvent;
RoleUpdatedEvent.eventName = 'role.updated';
//# sourceMappingURL=role-updated.event.js.map