import { Language } from "../entities/language.entity";

export const LANGUAGE_REPOSITORY = "LANGUAGE_REPOSITORY";

export interface LanguageRepository {
  findAll(): Promise<Language[]>;
  findById(id: number): Promise<Language | null>;
  findByCode(code: string): Promise<Language | null>;
  findActive(): Promise<Language[]>;
  findDefault(): Promise<Language | null>;
  save(language: Language): Promise<Language>;
  update(id: number, language: Partial<Language>): Promise<Language>;
  delete(id: number): Promise<void>;
}


