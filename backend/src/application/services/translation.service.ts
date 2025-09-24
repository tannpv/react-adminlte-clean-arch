import { Inject, Injectable } from "@nestjs/common";
import {
  LANGUAGE_REPOSITORY,
  LanguageRepository,
} from "../../domain/repositories/language.repository";
import {
  TRANSLATION_KEY_REPOSITORY,
  TRANSLATION_NAMESPACE_REPOSITORY,
  TRANSLATION_REPOSITORY,
  TranslationKeyRepository,
  TranslationNamespaceRepository,
  TranslationRepository,
} from "../../domain/repositories/translation.repository";
import { CreateLanguageDto } from "../dto/create-language.dto";
import { LanguageResponseDto } from "../dto/language-response.dto";
import { TranslationsByNamespaceResponseDto } from "../dto/translation-response.dto";
import { UpdateLanguageDto } from "../dto/update-language.dto";
import { TranslationCacheService } from "./translation-cache.service";

@Injectable()
export class TranslationService {
  constructor(
    @Inject(LANGUAGE_REPOSITORY)
    private readonly languageRepo: LanguageRepository,
    @Inject(TRANSLATION_REPOSITORY)
    private readonly translationRepo: TranslationRepository,
    @Inject(TRANSLATION_KEY_REPOSITORY)
    private readonly keyRepo: TranslationKeyRepository,
    @Inject(TRANSLATION_NAMESPACE_REPOSITORY)
    private readonly namespaceRepo: TranslationNamespaceRepository,
    private readonly cacheService: TranslationCacheService
  ) {}

  // Language management
  async createLanguage(
    createLanguageDto: CreateLanguageDto
  ): Promise<LanguageResponseDto> {
    // If this is set as default, unset other defaults
    if (createLanguageDto.isDefault) {
      const currentDefault = await this.languageRepo.findDefault();
      if (currentDefault) {
        await this.languageRepo.update(currentDefault.id, { isDefault: false });
      }
    }

    const language = await this.languageRepo.save(createLanguageDto as any);
    return this.toLanguageResponse(language);
  }

  async findAllLanguages(): Promise<LanguageResponseDto[]> {
    const languages = await this.languageRepo.findAll();
    return languages.map((lang) => this.toLanguageResponse(lang));
  }

  async findActiveLanguages(): Promise<LanguageResponseDto[]> {
    const languages = await this.languageRepo.findActive();
    return languages.map((lang) => this.toLanguageResponse(lang));
  }

  async findLanguageByCode(code: string): Promise<LanguageResponseDto | null> {
    const language = await this.languageRepo.findByCode(code);
    return language ? this.toLanguageResponse(language) : null;
  }

  async updateLanguage(
    id: number,
    updateLanguageDto: UpdateLanguageDto
  ): Promise<LanguageResponseDto> {
    // If this is set as default, unset other defaults
    if (updateLanguageDto.isDefault) {
      const currentDefault = await this.languageRepo.findDefault();
      if (currentDefault && currentDefault.id !== id) {
        await this.languageRepo.update(currentDefault.id, { isDefault: false });
      }
    }

    const language = await this.languageRepo.update(
      id,
      updateLanguageDto as any
    );
    return this.toLanguageResponse(language);
  }

  async deleteLanguage(id: number): Promise<void> {
    await this.languageRepo.delete(id);
  }

  // Translation management
  async getTranslations(
    languageCode: string,
    namespace: string
  ): Promise<Record<string, string>> {
    return this.cacheService.getTranslations(languageCode, namespace);
  }

  async getTranslation(
    languageCode: string,
    keyPath: string
  ): Promise<string | null> {
    return this.cacheService.getTranslation(languageCode, keyPath);
  }

  async getTranslationsByNamespace(
    languageCode: string,
    namespace: string
  ): Promise<TranslationsByNamespaceResponseDto> {
    const translations = await this.getTranslations(languageCode, namespace);
    return {
      namespace,
      translations,
    };
  }

  async getAllTranslationsForLanguage(
    languageCode: string
  ): Promise<TranslationsByNamespaceResponseDto[]> {
    const namespaces = await this.namespaceRepo.findAll();
    const results: TranslationsByNamespaceResponseDto[] = [];

    for (const namespace of namespaces) {
      const translations = await this.getTranslations(
        languageCode,
        namespace.name
      );
      results.push({
        namespace: namespace.name,
        translations,
      });
    }

    return results;
  }

  // Cache management
  async clearTranslationCache(
    languageCode?: string,
    namespace?: string
  ): Promise<void> {
    this.cacheService.clearCache(languageCode, namespace);
  }

  async getCacheStats(): Promise<{ size: number; keys: string[] }> {
    return this.cacheService.getCacheStats();
  }

  async warmUpCache(languageCode: string, namespaces: string[]): Promise<void> {
    await this.cacheService.warmUpCache(languageCode, namespaces);
  }

  // Translation management methods
  async createTranslation(
    languageCode: string,
    keyPath: string,
    value: string,
    notes?: string
  ): Promise<any> {
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

    const savedTranslation = await this.translationRepo.save(
      translation as any
    );
    this.cacheService.clearCache(languageCode); // Clear cache for this language
    return savedTranslation;
  }

  async updateTranslation(
    id: number,
    value: string,
    notes?: string
  ): Promise<any> {
    const translation = await this.translationRepo.update(id, {
      value,
      notes,
      updatedAt: new Date(),
    } as any);

    // Clear cache for the affected language
    const language = await this.languageRepo.findById(translation.languageId);
    if (language) {
      this.cacheService.clearCache(language.code);
    }

    return translation;
  }

  async deleteTranslation(id: number): Promise<void> {
    const translation = await this.translationRepo.findById(id);
    if (!translation) {
      throw new Error(`Translation with id ${id} not found`);
    }

    await this.translationRepo.delete(id);

    // Clear cache for the affected language
    const language = await this.languageRepo.findById(translation.languageId);
    if (language) {
      this.cacheService.clearCache(language.code);
    }
  }

  async getAllTranslations(
    languageCode?: string,
    namespace?: string
  ): Promise<any[]> {
    // Get all translation keys with their translations
    const keys = await this.keyRepo.findAll();
    const results: any[] = [];

    for (const key of keys) {
      // Get the namespace for this key
      const keyNamespace = await this.namespaceRepo.findById(key.namespaceId);

      // If namespace filter is specified, skip if it doesn't match
      if (namespace && keyNamespace?.name !== namespace) {
        continue;
      }

      // Get all translations for this key
      const translations = await this.translationRepo.findByKeyId(key.id);

      for (const translation of translations) {
        // Get the language for this translation
        const language = await this.languageRepo.findById(
          translation.languageId
        );

        // If language filter is specified, skip if it doesn't match
        if (languageCode && language?.code !== languageCode) {
          continue;
        }

        results.push({
          id: translation.id,
          keyPath: key.key_path,
          value: translation.value,
          notes: translation.notes,
          isActive: translation.isActive,
          languageCode: language?.code,
          languageName: language?.name,
          namespace: keyNamespace?.name,
          createdAt: translation.createdAt,
          updatedAt: translation.updatedAt,
        });
      }
    }

    return results;
  }

  // Helper methods
  private toLanguageResponse(language: any): LanguageResponseDto {
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
}
