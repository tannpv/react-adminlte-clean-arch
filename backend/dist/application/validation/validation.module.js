"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationModule = void 0;
const common_1 = require("@nestjs/common");
const persistence_module_1 = require("../../infrastructure/persistence/persistence.module");
const user_validation_service_1 = require("./user-validation.service");
const user_update_validation_service_1 = require("./user-update-validation.service");
let ValidationModule = class ValidationModule {
};
exports.ValidationModule = ValidationModule;
exports.ValidationModule = ValidationModule = __decorate([
    (0, common_1.Module)({
        imports: [persistence_module_1.PersistenceModule],
        providers: [
            user_validation_service_1.UserValidationService,
            user_update_validation_service_1.UserUpdateValidationService,
        ],
        exports: [
            user_validation_service_1.UserValidationService,
            user_update_validation_service_1.UserUpdateValidationService,
        ],
    })
], ValidationModule);
//# sourceMappingURL=validation.module.js.map