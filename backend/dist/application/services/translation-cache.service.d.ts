import { TranslationRepository } from "../../domain/repositories/translation.repository";
export declare class TranslationCacheService {
    private readonly translationRepo;
    private cache;
    private readonly CACHE_TTL;
    constructor(translationRepo: TranslationRepository);
    getTranslations(languageCode: string, namespace: string): Promise<Record<string, string>>;
    getTranslation(languageCode: string, keyPath: string): Promise<string | null>;
    clearCache(languageCode?: string, namespace?: string): void;
    getCacheStats(): {
        size: number;
        keys: string[];
    };
    warmUpCache(languageCode: string, namespaces: string[]): Promise<void>;
}
