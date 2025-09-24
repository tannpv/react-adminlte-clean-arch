import { CreateLanguageDto } from "../../../application/dto/create-language.dto";
import { UpdateLanguageDto } from "../../../application/dto/update-language.dto";
import { TranslationService } from "../../../application/services/translation.service";
export declare class TranslationController {
    private readonly translationService;
    constructor(translationService: TranslationService);
    createLanguage(createLanguageDto: CreateLanguageDto): Promise<import("../../../application/dto/language-response.dto").LanguageResponseDto>;
    findAllLanguages(): Promise<import("../../../application/dto/language-response.dto").LanguageResponseDto[]>;
    findActiveLanguages(): Promise<import("../../../application/dto/language-response.dto").LanguageResponseDto[]>;
    findLanguageByCode(code: string): Promise<import("../../../application/dto/language-response.dto").LanguageResponseDto | null>;
    updateLanguage(id: number, updateLanguageDto: UpdateLanguageDto): Promise<import("../../../application/dto/language-response.dto").LanguageResponseDto>;
    deleteLanguage(id: number): Promise<{
        message: string;
    }>;
    getTranslationsByNamespace(languageCode: string, namespace: string): Promise<import("../../../application/dto/translation-response.dto").TranslationsByNamespaceResponseDto>;
    getAllTranslationsForLanguage(languageCode: string): Promise<import("../../../application/dto/translation-response.dto").TranslationsByNamespaceResponseDto[]>;
    getTranslation(languageCode: string, keyPath: string): Promise<{
        keyPath: string;
        translation: string | null;
    }>;
    clearCache(languageCode?: string, namespace?: string): Promise<{
        message: string;
    }>;
    getCacheStats(): Promise<{
        size: number;
        keys: string[];
    }>;
    warmUpCache(body: {
        languageCode: string;
        namespaces: string[];
    }): Promise<{
        message: string;
    }>;
    createTranslation(body: {
        languageCode: string;
        keyPath: string;
        value: string;
        notes?: string;
    }): Promise<any>;
    updateTranslation(id: number, body: {
        value: string;
        notes?: string;
    }): Promise<any>;
    deleteTranslation(id: number): Promise<{
        message: string;
    }>;
    getAllTranslations(languageCode?: string, namespace?: string): Promise<any[]>;
}
