"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRemovedEvent = void 0;
const domain_event_1 = require("./domain-event");
class RoleRemovedEvent extends domain_event_1.DomainEvent {
    constructor(role) {
        super();
        this.role = role;
        this.name = RoleRemovedEvent.eventName;
    }
}
exports.RoleRemovedEvent = RoleRemovedEvent;
RoleRemovedEvent.eventName = 'role.removed';
//# sourceMappingURL=role-removed.event.js.map