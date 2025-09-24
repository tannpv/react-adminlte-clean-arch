import { TranslationKey } from "../../../domain/entities/translation-key.entity";
import { TranslationNamespace } from "../../../domain/entities/translation-namespace.entity";
import { Translation } from "../../../domain/entities/translation.entity";
import { TranslationKeyRepository, TranslationNamespaceRepository, TranslationRepository } from "../../../domain/repositories/translation.repository";
import { MysqlDatabaseService } from "./mysql-database.service";
export declare class MysqlTranslationRepository implements TranslationRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findByLanguageAndNamespace(languageCode: string, namespace: string): Promise<Record<string, string>>;
    findByLanguageAndKeyPath(languageCode: string, keyPath: string): Promise<string | null>;
    save(translation: Translation): Promise<Translation>;
    update(id: number, translation: Partial<Translation>): Promise<Translation>;
    delete(id: number): Promise<void>;
    bulkSave(translations: Translation[]): Promise<Translation[]>;
    findById(id: number): Promise<Translation | null>;
}
export declare class MysqlTranslationKeyRepository implements TranslationKeyRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findAll(): Promise<TranslationKey[]>;
    findByNamespace(namespaceId: number): Promise<TranslationKey[]>;
    findByKeyPath(keyPath: string): Promise<TranslationKey | null>;
    save(key: TranslationKey): Promise<TranslationKey>;
    update(id: number, key: Partial<TranslationKey>): Promise<TranslationKey>;
    delete(id: number): Promise<void>;
    bulkSave(keys: TranslationKey[]): Promise<TranslationKey[]>;
    private findById;
}
export declare class MysqlTranslationNamespaceRepository implements TranslationNamespaceRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findAll(): Promise<TranslationNamespace[]>;
    findById(id: number): Promise<TranslationNamespace | null>;
    findByName(name: string): Promise<TranslationNamespace | null>;
    save(namespace: TranslationNamespace): Promise<TranslationNamespace>;
    update(id: number, namespace: Partial<TranslationNamespace>): Promise<TranslationNamespace>;
    delete(id: number): Promise<void>;
}
