import { Language } from "../../../domain/entities/language.entity";
import { LanguageRepository } from "../../../domain/repositories/language.repository";
import { MysqlDatabaseService } from "./mysql-database.service";
export declare class MysqlLanguageRepository implements LanguageRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findAll(): Promise<Language[]>;
    findById(id: number): Promise<Language | null>;
    findByCode(code: string): Promise<Language | null>;
    findActive(): Promise<Language[]>;
    findDefault(): Promise<Language | null>;
    save(language: Language): Promise<Language>;
    update(id: number, language: Partial<Language>): Promise<Language>;
    delete(id: number): Promise<void>;
}
