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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationController = void 0;
const common_1 = require("@nestjs/common");
const create_language_dto_1 = require("../../../application/dto/create-language.dto");
const update_language_dto_1 = require("../../../application/dto/update-language.dto");
const translation_service_1 = require("../../../application/services/translation.service");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const permissions_guard_1 = require("../guards/permissions.guard");
let TranslationController = class TranslationController {
    constructor(translationService) {
        this.translationService = translationService;
    }
    async createLanguage(createLanguageDto) {
        return this.translationService.createLanguage(createLanguageDto);
    }
    async findAllLanguages() {
        return this.translationService.findAllLanguages();
    }
    async findActiveLanguages() {
        return this.translationService.findActiveLanguages();
    }
    async findLanguageByCode(code) {
        return this.translationService.findLanguageByCode(code);
    }
    async updateLanguage(id, updateLanguageDto) {
        return this.translationService.updateLanguage(id, updateLanguageDto);
    }
    async deleteLanguage(id) {
        await this.translationService.deleteLanguage(id);
        return { message: "Language deleted successfully" };
    }
    async getTranslationsByNamespace(languageCode, namespace) {
        return this.translationService.getTranslationsByNamespace(languageCode, namespace);
    }
    async getAllTranslationsForLanguage(languageCode) {
        return this.translationService.getAllTranslationsForLanguage(languageCode);
    }
    async getTranslation(languageCode, keyPath) {
        const translation = await this.translationService.getTranslation(languageCode, keyPath);
        return { keyPath, translation };
    }
    async clearCache(languageCode, namespace) {
        await this.translationService.clearTranslationCache(languageCode, namespace);
        return { message: "Cache cleared successfully" };
    }
    async getCacheStats() {
        return this.translationService.getCacheStats();
    }
    async warmUpCache(body) {
        await this.translationService.warmUpCache(body.languageCode, body.namespaces);
        return { message: "Cache warmed up successfully" };
    }
    async createTranslation(body) {
        return this.translationService.createTranslation(body.languageCode, body.keyPath, body.value, body.notes);
    }
    async updateTranslation(id, body) {
        return this.translationService.updateTranslation(id, body.value, body.notes);
    }
    async deleteTranslation(id) {
        await this.translationService.deleteTranslation(id);
        return { message: "Translation deleted successfully" };
    }
    async getAllTranslations(languageCode, namespace) {
        return this.translationService.getAllTranslations(languageCode, namespace);
    }
};
exports.TranslationController = TranslationController;
__decorate([
    (0, common_1.Post)("languages"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:create", "admin:all"),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_language_dto_1.CreateLanguageDto]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "createLanguage", null);
__decorate([
    (0, common_1.Get)("languages"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:read", "admin:all"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "findAllLanguages", null);
__decorate([
    (0, common_1.Get)("languages/active"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:read", "admin:all"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "findActiveLanguages", null);
__decorate([
    (0, common_1.Get)("languages/:code"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:read", "admin:all"),
    __param(0, (0, common_1.Param)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "findLanguageByCode", null);
__decorate([
    (0, common_1.Put)("languages/:id"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:update", "admin:all"),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_language_dto_1.UpdateLanguageDto]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "updateLanguage", null);
__decorate([
    (0, common_1.Delete)("languages/:id"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:delete", "admin:all"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "deleteLanguage", null);
__decorate([
    (0, common_1.Get)("languages/:languageCode/namespaces/:namespace"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:read", "admin:all"),
    __param(0, (0, common_1.Param)("languageCode")),
    __param(1, (0, common_1.Param)("namespace")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "getTranslationsByNamespace", null);
__decorate([
    (0, common_1.Get)("languages/:languageCode/translations"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:read", "admin:all"),
    __param(0, (0, common_1.Param)("languageCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "getAllTranslationsForLanguage", null);
__decorate([
    (0, common_1.Get)("translate/:languageCode/:keyPath"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:read", "admin:all"),
    __param(0, (0, common_1.Param)("languageCode")),
    __param(1, (0, common_1.Param)("keyPath")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "getTranslation", null);
__decorate([
    (0, common_1.Post)("cache/clear"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:manage", "admin:all"),
    __param(0, (0, common_1.Query)("languageCode")),
    __param(1, (0, common_1.Query)("namespace")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "clearCache", null);
__decorate([
    (0, common_1.Get)("cache/stats"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:read", "admin:all"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Post)("cache/warmup"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:manage", "admin:all"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "warmUpCache", null);
__decorate([
    (0, common_1.Post)("translations"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:create", "admin:all"),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "createTranslation", null);
__decorate([
    (0, common_1.Put)("translations/:id"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:update", "admin:all"),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "updateTranslation", null);
__decorate([
    (0, common_1.Delete)("translations/:id"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:delete", "admin:all"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "deleteTranslation", null);
__decorate([
    (0, common_1.Get)("translations"),
    (0, permissions_decorator_1.RequireAnyPermission)("translations:read", "admin:all"),
    __param(0, (0, common_1.Query)("languageCode")),
    __param(1, (0, common_1.Query)("namespace")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "getAllTranslations", null);
exports.TranslationController = TranslationController = __decorate([
    (0, common_1.Controller)("translations"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [translation_service_1.TranslationService])
], TranslationController);
//# sourceMappingURL=translation.controller.js.map