"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreatedEvent = void 0;
const domain_event_1 = require("./domain-event");
class UserCreatedEvent extends domain_event_1.DomainEvent {
    constructor(user) {
        super();
        this.user = user;
        this.name = UserCreatedEvent.eventName;
    }
}
exports.UserCreatedEvent = UserCreatedEvent;
UserCreatedEvent.eventName = 'user.created';
//# sourceMappingURL=user-created.event.js.map