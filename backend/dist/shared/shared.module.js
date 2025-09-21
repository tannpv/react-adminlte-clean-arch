"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const common_1 = require("@nestjs/common");
const password_service_1 = require("./password.service");
const token_service_1 = require("./token.service");
const domain_event_bus_1 = require("./events/domain-event.bus");
const storage_service_1 = require("./services/storage.service");
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Module)({
        providers: [password_service_1.PasswordService, token_service_1.TokenService, domain_event_bus_1.DomainEventBus, storage_service_1.StorageService],
        exports: [password_service_1.PasswordService, token_service_1.TokenService, domain_event_bus_1.DomainEventBus, storage_service_1.StorageService],
    })
], SharedModule);
//# sourceMappingURL=shared.module.js.map