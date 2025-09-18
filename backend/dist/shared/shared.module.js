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
const config_1 = require("@nestjs/config");
const password_service_1 = require("./password.service");
const token_service_1 = require("./token.service");
const domain_event_bus_1 = require("./events/domain-event.bus");
const config_2 = require("./config");
const constants_1 = require("./constants");
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: config_2.PASSWORD_CONFIG,
                useFactory: (config) => ({
                    saltRounds: Number(config.get('BCRYPT_SALT_ROUNDS') ?? 10),
                }),
                inject: [config_1.ConfigService],
            },
            {
                provide: config_2.JWT_CONFIG,
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET') ?? constants_1.DEFAULT_JWT_SECRET,
                    expiresIn: config.get('JWT_EXPIRES_IN') ?? '1h',
                }),
                inject: [config_1.ConfigService],
            },
            password_service_1.PasswordService,
            token_service_1.TokenService,
            domain_event_bus_1.DomainEventBus,
        ],
        exports: [password_service_1.PasswordService, token_service_1.TokenService, domain_event_bus_1.DomainEventBus],
    })
], SharedModule);
//# sourceMappingURL=shared.module.js.map