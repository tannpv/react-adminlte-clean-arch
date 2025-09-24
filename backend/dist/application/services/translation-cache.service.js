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
exports.TranslationCacheService = void 0;
const common_1 = require("@nestjs/common");
const translation_repository_1 = require("../../domain/repositories/translation.repository");
let TranslationCacheService = class TranslationCacheService {
    constructor(translationRepo) {
        this.translationRepo = translationRepo;
        this.cache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
    }
    async getTranslations(languageCode, namespace) {
        const cacheKey = `${languageCode}:${namespace}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        const translations = await this.translationRepo.findByLanguageAndNamespace(languageCode, namespace);
        this.cache.set(cacheKey, {
            data: translations,
            timestamp: Date.now(),
        });
        return translations;
    }
    async getTranslation(languageCode, keyPath) {
        const cacheKey = `single:${languageCode}:${keyPath}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        const translation = await this.translationRepo.findByLanguageAndKeyPath(languageCode, keyPath);
        this.cache.set(cacheKey, {
            data: translation,
            timestamp: Date.now(),
        });
        return translation;
    }
    clearCache(languageCode, namespace) {
        if (languageCode && namespace) {
            this.cache.delete(`${languageCode}:${namespace}`);
        }
        else if (languageCode) {
            for (const key of this.cache.keys()) {
                if (key.includes(`:${languageCode}:`) ||
                    key.startsWith(`${languageCode}:`)) {
                    this.cache.delete(key);
                }
            }
        }
        else {
            this.cache.clear();
        }
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
    async warmUpCache(languageCode, namespaces) {
        const promises = namespaces.map((namespace) => this.getTranslations(languageCode, namespace));
        await Promise.all(promises);
    }
};
exports.TranslationCacheService = TranslationCacheService;
exports.TranslationCacheService = TranslationCacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(translation_repository_1.TRANSLATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], TranslationCacheService);
//# sourceMappingURL=translation-cache.service.js.map