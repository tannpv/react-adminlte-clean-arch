"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DomainEventBus_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEventBus = void 0;
const common_1 = require("@nestjs/common");
let DomainEventBus = DomainEventBus_1 = class DomainEventBus {
    constructor() {
        this.handlers = new Map();
        this.logger = new common_1.Logger(DomainEventBus_1.name);
    }
    publish(event) {
        const { name } = event;
        const subscribers = this.handlers.get(name);
        if (!subscribers?.size) {
            this.logger.debug?.(`No subscribers for event ${name}`);
            return;
        }
        subscribers.forEach((handler) => {
            try {
                const result = handler(event);
                if (result instanceof Promise) {
                    result.catch((err) => this.logger.error(`Handler for ${name} rejected`, err?.stack || err));
                }
            }
            catch (err) {
                this.logger.error(`Handler for ${name} threw`, err?.stack || err);
            }
        });
    }
    async publishAll(events) {
        events.forEach((event) => this.publish(event));
    }
    subscribe(eventName, handler) {
        const existing = this.handlers.get(eventName);
        if (existing) {
            existing.add(handler);
        }
        else {
            this.handlers.set(eventName, new Set([handler]));
        }
        return () => {
            const set = this.handlers.get(eventName);
            set?.delete(handler);
            if (set && set.size === 0) {
                this.handlers.delete(eventName);
            }
        };
    }
};
exports.DomainEventBus = DomainEventBus;
exports.DomainEventBus = DomainEventBus = DomainEventBus_1 = __decorate([
    (0, common_1.Injectable)()
], DomainEventBus);
//# sourceMappingURL=domain-event.bus.js.map