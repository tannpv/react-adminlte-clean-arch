"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationsModule = void 0;
const common_1 = require("@nestjs/common");
const translation_cache_service_1 = require("../../application/services/translation-cache.service");
const translation_service_1 = require("../../application/services/translation.service");
const access_control_module_1 = require("../../infrastructure/http/access-control.module");
const translation_controller_1 = require("../../infrastructure/http/controllers/translation.controller");
const persistence_module_1 = require("../../infrastructure/persistence/persistence.module");
const shared_module_1 = require("../../shared/shared.module");
let TranslationsModule = class TranslationsModule {
};
exports.TranslationsModule = TranslationsModule;
exports.TranslationsModule = TranslationsModule = __decorate([
    (0, common_1.Module)({
        imports: [persistence_module_1.PersistenceModule, access_control_module_1.AccessControlModule, shared_module_1.SharedModule],
        controllers: [translation_controller_1.TranslationController],
        providers: [translation_service_1.TranslationService, translation_cache_service_1.TranslationCacheService],
        exports: [translation_service_1.TranslationService, translation_cache_service_1.TranslationCacheService],
    })
], TranslationsModule);
//# sourceMappingURL=translations.module.js.map