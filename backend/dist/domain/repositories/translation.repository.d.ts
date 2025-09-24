import { TranslationKey } from "../entities/translation-key.entity";
import { TranslationNamespace } from "../entities/translation-namespace.entity";
import { Translation } from "../entities/translation.entity";
export declare const TRANSLATION_REPOSITORY = "TRANSLATION_REPOSITORY";
export declare const TRANSLATION_KEY_REPOSITORY = "TRANSLATION_KEY_REPOSITORY";
export declare const TRANSLATION_NAMESPACE_REPOSITORY = "TRANSLATION_NAMESPACE_REPOSITORY";
export interface TranslationRepository {
    findByLanguageAndNamespace(languageCode: string, namespace: string): Promise<Record<string, string>>;
    findByLanguageAndKeyPath(languageCode: string, keyPath: string): Promise<string | null>;
    findById(id: number): Promise<Translation | null>;
    save(translation: Translation): Promise<Translation>;
    update(id: number, translation: Partial<Translation>): Promise<Translation>;
    delete(id: number): Promise<void>;
    bulkSave(translations: Translation[]): Promise<Translation[]>;
}
export interface TranslationKeyRepository {
    findAll(): Promise<TranslationKey[]>;
    findByNamespace(namespaceId: number): Promise<TranslationKey[]>;
    findByKeyPath(keyPath: string): Promise<TranslationKey | null>;
    save(key: TranslationKey): Promise<TranslationKey>;
    update(id: number, key: Partial<TranslationKey>): Promise<TranslationKey>;
    delete(id: number): Promise<void>;
    bulkSave(keys: TranslationKey[]): Promise<TranslationKey[]>;
}
export interface TranslationNamespaceRepository {
    findAll(): Promise<TranslationNamespace[]>;
    findById(id: number): Promise<TranslationNamespace | null>;
    findByName(name: string): Promise<TranslationNamespace | null>;
    save(namespace: TranslationNamespace): Promise<TranslationNamespace>;
    update(id: number, namespace: Partial<TranslationNamespace>): Promise<TranslationNamespace>;
    delete(id: number): Promise<void>;
}
