"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleCreatedEvent = void 0;
const domain_event_1 = require("./domain-event");
class RoleCreatedEvent extends domain_event_1.DomainEvent {
    constructor(role) {
        super();
        this.role = role;
        this.name = RoleCreatedEvent.eventName;
    }
}
exports.RoleCreatedEvent = RoleCreatedEvent;
RoleCreatedEvent.eventName = 'role.created';
//# sourceMappingURL=role-created.event.js.map