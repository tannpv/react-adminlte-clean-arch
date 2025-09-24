import { LanguageRepository } from "../../domain/repositories/language.repository";
import { TranslationKeyRepository, TranslationNamespaceRepository, TranslationRepository } from "../../domain/repositories/translation.repository";
import { CreateLanguageDto } from "../dto/create-language.dto";
import { LanguageResponseDto } from "../dto/language-response.dto";
import { TranslationsByNamespaceResponseDto } from "../dto/translation-response.dto";
import { UpdateLanguageDto } from "../dto/update-language.dto";
import { TranslationCacheService } from "./translation-cache.service";
export declare class TranslationService {
    private readonly languageRepo;
    private readonly translationRepo;
    private readonly keyRepo;
    private readonly namespaceRepo;
    private readonly cacheService;
    constructor(languageRepo: LanguageRepository, translationRepo: TranslationRepository, keyRepo: TranslationKeyRepository, namespaceRepo: TranslationNamespaceRepository, cacheService: TranslationCacheService);
    createLanguage(createLanguageDto: CreateLanguageDto): Promise<LanguageResponseDto>;
    findAllLanguages(): Promise<LanguageResponseDto[]>;
    findActiveLanguages(): Promise<LanguageResponseDto[]>;
    findLanguageByCode(code: string): Promise<LanguageResponseDto | null>;
    updateLanguage(id: number, updateLanguageDto: UpdateLanguageDto): Promise<LanguageResponseDto>;
    deleteLanguage(id: number): Promise<void>;
    getTranslations(languageCode: string, namespace: string): Promise<Record<string, string>>;
    getTranslation(languageCode: string, keyPath: string): Promise<string | null>;
    getTranslationsByNamespace(languageCode: string, namespace: string): Promise<TranslationsByNamespaceResponseDto>;
    getAllTranslationsForLanguage(languageCode: string): Promise<TranslationsByNamespaceResponseDto[]>;
    clearTranslationCache(languageCode?: string, namespace?: string): Promise<void>;
    getCacheStats(): Promise<{
        size: number;
        keys: string[];
    }>;
    warmUpCache(languageCode: string, namespaces: string[]): Promise<void>;
    createTranslation(languageCode: string, keyPath: string, value: string, notes?: string): Promise<any>;
    updateTranslation(id: number, value: string, notes?: string): Promise<any>;
    deleteTranslation(id: number): Promise<void>;
    getAllTranslations(languageCode?: string, namespace?: string): Promise<any[]>;
    private toLanguageResponse;
}
