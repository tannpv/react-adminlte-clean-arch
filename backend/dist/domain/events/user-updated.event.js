"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUpdatedEvent = void 0;
const domain_event_1 = require("./domain-event");
class UserUpdatedEvent extends domain_event_1.DomainEvent {
    constructor(user) {
        super();
        this.user = user;
        this.name = UserUpdatedEvent.eventName;
    }
}
exports.UserUpdatedEvent = UserUpdatedEvent;
UserUpdatedEvent.eventName = 'user.updated';
//# sourceMappingURL=user-updated.event.js.map