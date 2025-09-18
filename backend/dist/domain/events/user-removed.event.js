"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRemovedEvent = void 0;
const domain_event_1 = require("./domain-event");
class UserRemovedEvent extends domain_event_1.DomainEvent {
    constructor(user) {
        super();
        this.user = user;
        this.name = UserRemovedEvent.eventName;
    }
}
exports.UserRemovedEvent = UserRemovedEvent;
UserRemovedEvent.eventName = 'user.removed';
//# sourceMappingURL=user-removed.event.js.map