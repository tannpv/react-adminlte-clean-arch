"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationEventsSubscriber = void 0;
const common_1 = require("@nestjs/common");
const authorization_service_1 = require("../../application/services/authorization.service");
const domain_event_bus_1 = require("../../shared/events/domain-event.bus");
const user_created_event_1 = require("../../domain/events/user-created.event");
const user_updated_event_1 = require("../../domain/events/user-updated.event");
const user_removed_event_1 = require("../../domain/events/user-removed.event");
const role_created_event_1 = require("../../domain/events/role-created.event");
const role_updated_event_1 = require("../../domain/events/role-updated.event");
const role_removed_event_1 = require("../../domain/events/role-removed.event");
let AuthorizationEventsSubscriber = class AuthorizationEventsSubscriber {
    constructor(bus, authorization) {
        this.bus = bus;
        this.authorization = authorization;
        this.unsubscribers = [];
        this.unsubscribers.push(this.bus.subscribe(user_created_event_1.UserCreatedEvent.eventName, (event) => {
            const typed = event;
            if (typed?.user?.id) {
                this.authorization.evictPermissionsForUser(typed.user.id);
            }
        }), this.bus.subscribe(user_updated_event_1.UserUpdatedEvent.eventName, (event) => {
            const typed = event;
            if (typed?.user?.id) {
                this.authorization.evictPermissionsForUser(typed.user.id);
            }
        }), this.bus.subscribe(user_removed_event_1.UserRemovedEvent.eventName, (event) => {
            const typed = event;
            if (typed?.user?.id) {
                this.authorization.evictPermissionsForUser(typed.user.id);
            }
        }), this.bus.subscribe(role_created_event_1.RoleCreatedEvent.eventName, () => this.authorization.evictAllPermissions()), this.bus.subscribe(role_updated_event_1.RoleUpdatedEvent.eventName, () => this.authorization.evictAllPermissions()), this.bus.subscribe(role_removed_event_1.RoleRemovedEvent.eventName, () => this.authorization.evictAllPermissions()));
    }
    onModuleDestroy() {
        this.unsubscribers.forEach((unsubscribe) => unsubscribe());
        this.unsubscribers.length = 0;
    }
};
exports.AuthorizationEventsSubscriber = AuthorizationEventsSubscriber;
exports.AuthorizationEventsSubscriber = AuthorizationEventsSubscriber = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [domain_event_bus_1.DomainEventBus, authorization_service_1.AuthorizationService])
], AuthorizationEventsSubscriber);
//# sourceMappingURL=authorization-events.subscriber.js.map