"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const common_1 = require("@nestjs/common");
const file_manager_controller_1 = require("../../infrastructure/http/controllers/file-manager.controller");
const file_manager_service_1 = require("../../application/services/file-manager.service");
const persistence_module_1 = require("../../infrastructure/persistence/persistence.module");
const shared_module_1 = require("../../shared/shared.module");
const access_control_module_1 = require("../../infrastructure/http/access-control.module");
const users_module_1 = require("../users/users.module");
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = __decorate([
    (0, common_1.Module)({
        imports: [persistence_module_1.PersistenceModule, shared_module_1.SharedModule, access_control_module_1.AccessControlModule, users_module_1.UsersModule],
        controllers: [file_manager_controller_1.FileManagerController],
        providers: [file_manager_service_1.FileManagerService],
        exports: [file_manager_service_1.FileManagerService],
    })
], StorageModule);
//# sourceMappingURL=storage.module.js.map