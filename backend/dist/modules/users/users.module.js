"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_controller_1 = require("../../infrastructure/http/controllers/users.controller");
const users_service_1 = require("../../application/services/users.service");
const persistence_module_1 = require("../../infrastructure/persistence/persistence.module");
const shared_module_1 = require("../../shared/shared.module");
const access_control_module_1 = require("../../infrastructure/http/access-control.module");
const me_controller_1 = require("../../infrastructure/http/controllers/me.controller");
const roles_module_1 = require("../roles/roles.module");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [persistence_module_1.PersistenceModule, shared_module_1.SharedModule, access_control_module_1.AccessControlModule, roles_module_1.RolesModule],
        controllers: [users_controller_1.UsersController, me_controller_1.MeController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map