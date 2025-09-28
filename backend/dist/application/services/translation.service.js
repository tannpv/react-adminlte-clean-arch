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
exports.TranslationService = void 0;
const common_1 = require("@nestjs/common");
const language_repository_1 = require("../../domain/repositories/language.repository");
const translation_repository_1 = require("../../domain/repositories/translation.repository");
const translation_cache_service_1 = require("./translation-cache.service");
let TranslationService = class TranslationService {
    constructor(languageRepo, translationRepo, keyRepo, namespaceRepo, cacheService) {
        this.languageRepo = languageRepo;
        this.translationRepo = translationRepo;
        this.keyRepo = keyRepo;
        this.namespaceRepo = namespaceRepo;
        this.cacheService = cacheService;
    }
    async createLanguage(createLanguageDto) {
        if (createLanguageDto.isDefault) {
            const currentDefault = await this.languageRepo.findDefault();
            if (currentDefault) {
                await this.languageRepo.update(currentDefault.id, { isDefault: false });
            }
        }
        const language = await this.languageRepo.save(createLanguageDto);
        return this.toLanguageResponse(language);
    }
    async findAllLanguages() {
        const languages = await this.languageRepo.findAll();
        return languages.map((lang) => this.toLanguageResponse(lang));
    }
    async findActiveLanguages() {
        const languages = await this.languageRepo.findActive();
        return languages.map((lang) => this.toLanguageResponse(lang));
    }
    async findLanguageByCode(code) {
        const language = await this.languageRepo.findByCode(code);
        return language ? this.toLanguageResponse(language) : null;
    }
    async updateLanguage(id, updateLanguageDto) {
        if (updateLanguageDto.isDefault) {
            const currentDefault = await this.languageRepo.findDefault();
            if (currentDefault && currentDefault.id !== id) {
                await this.languageRepo.update(currentDefault.id, { isDefault: false });
            }
        }
        const language = await this.languageRepo.update(id, updateLanguageDto);
        return this.toLanguageResponse(language);
    }
    async deleteLanguage(id) {
        await this.languageRepo.delete(id);
    }
    async getTranslations(languageCode, namespace) {
        return this.cacheService.getTranslations(languageCode, namespace);
    }
    async getTranslation(languageCode, keyPath) {
        return this.cacheService.getTranslation(languageCode, keyPath);
    }
    async getTranslationsByNamespace(languageCode, namespace) {
        const translations = await this.getTranslations(languageCode, namespace);
        return {
            namespace,
            translations,
        };
    }
    async getAllTranslationsForLanguage(languageCode) {
        const namespaces = await this.namespaceRepo.findAll();
        const results = [];
        for (const namespace of namespaces) {
            const translations = await this.getTranslations(languageCode, namespace.name);
            results.push({
                namespace: namespace.name,
                translations,
            });
        }
        return results;
    }
    async clearTranslationCache(languageCode, namespace) {
        this.cacheService.clearCache(languageCode, namespace);
    }
    async getCacheStats() {
        return this.cacheService.getCacheStats();
    }
    async warmUpCache(languageCode, namespaces) {
        await this.cacheService.warmUpCache(languageCode, namespaces);
    }
    async createTranslation(languageCode, keyPath, value, notes) {
        const language = await this.languageRepo.findByCode(languageCode);
        if (!language) {
            throw new Error(`Language with code ${languageCode} not found`);
        }
        const key = await this.keyRepo.findByKeyPath(keyPath);
        if (!key) {
            throw new Error(`Translation key ${keyPath} not found`);
        }
        const translation = {
            value,
            notes,
            isActive: true,
            languageId: language.id,
            keyId: key.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const savedTranslation = await this.translationRepo.save(translation);
        this.cacheService.clearCache(languageCode);
        return savedTranslation;
    }
    async updateTranslation(id, value, notes) {
        const translation = await this.translationRepo.update(id, {
            value,
            notes,
            updatedAt: new Date(),
        });
        const language = await this.languageRepo.findById(translation.languageId);
        if (language) {
            this.cacheService.clearCache(language.code);
        }
        return translation;
    }
    async deleteTranslation(id) {
        const translation = await this.translationRepo.findById(id);
        if (!translation) {
            throw new Error(`Translation with id ${id} not found`);
        }
        await this.translationRepo.delete(id);
        const language = await this.languageRepo.findById(translation.languageId);
        if (language) {
            this.cacheService.clearCache(language.code);
        }
    }
    async getAllTranslations(languageCode, namespace) {
        return [];
    }
    toLanguageResponse(language) {
        return {
            id: language.id,
            code: language.code,
            name: language.name,
            nativeName: language.nativeName,
            isDefault: language.isDefault,
            isActive: language.isActive,
            flagIcon: language.flagIcon,
            createdAt: language.createdAt,
            updatedAt: language.updatedAt,
        };
    }
};
exports.TranslationService = TranslationService;
exports.TranslationService = TranslationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(language_repository_1.LANGUAGE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(translation_repository_1.TRANSLATION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(translation_repository_1.TRANSLATION_KEY_REPOSITORY)),
    __param(3, (0, common_1.Inject)(translation_repository_1.TRANSLATION_NAMESPACE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, translation_cache_service_1.TranslationCacheService])
], TranslationService);
//# sourceMappingURL=translation.service.js.map