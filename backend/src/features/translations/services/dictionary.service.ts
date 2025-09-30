import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { LanguageValueRepository } from "../repositories/language-value.repository";
import { LanguageRepository } from "../repositories/language.repository";
import { CacheService } from "./cache.service";

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    private readonly languageRepository: LanguageRepository,
    private readonly languageValueRepository: LanguageValueRepository,
    private readonly cacheService: CacheService
  ) {}

  async get(langCode: string, key: string): Promise<string> {
    try {
      // Normalize lang code and key
      const lookupLangCode = this.normalizeLangCode(langCode, "en");
      const lookupKey = this.normalizeKey(key);
      const encryptLookupKey = this.md5(lookupKey);

      // Check cache first
      const cacheEnabled = await this.isCacheEnabled();
      let result: string | null = null;

      if (cacheEnabled) {
        result = await this.cacheService.getLanguageValue(
          encryptLookupKey,
          lookupLangCode
        );
      }

      if (!result) {
        // Get from database
        const languageValue = await this.getLanguageValue(
          lookupLangCode,
          lookupKey
        );
        if (languageValue) {
          result = languageValue.destinationValue;
          // Cache the result
          if (cacheEnabled) {
            await this.cacheService.setLanguageValue(
              encryptLookupKey,
              lookupLangCode,
              result || ''
            );
          }
        }
      }

      if (!result) {
        // Try fallback languages
        const languageCodes = await this.getLanguageCodes(lookupLangCode);
        for (const languageCode of languageCodes) {
          const languageValue = await this.getLanguageValue(
            languageCode,
            lookupKey
          );
          if (!languageValue) {
            // Insert new translation
            this.logger.warn(
              `Translation not found for: ${key}, inserting new translation`
            );
            await this.insert(languageCode, lookupKey, key);
          } else if (languageCode === lookupLangCode) {
            result = languageValue.destinationValue;
          }
        }

        if (!result) {
          result = key; // Fallback to original key
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Error getting translation for key: ${key}`, error);
      return key; // Fallback to original key
    }
  }

  async refresh(langCode: string, key?: string): Promise<void> {
    try {
      if (!key) return;

      const lookupLangCode = this.normalizeLangCode(langCode, "en");
      const lookupKey = this.normalizeKey(key);

      const cacheEnabled = await this.isCacheEnabled();
      if (cacheEnabled) {
        const languageValue =
          await this.languageValueRepository.findByLanguageAndOriginalKey(
            lookupLangCode,
            lookupKey
          );

        if (languageValue) {
          await this.cacheService.removeLanguageValueCache(languageValue);
          await this.cacheService.insertLanguageValueCache(languageValue);
        }
      }
    } catch (error) {
      this.logger.error(`Error refreshing translation for key: ${key}`, error);
    }
  }

  async insert(langCode: string, key: string, value: string): Promise<void> {
    try {
      const languageValue = {
        keyHash: this.md5(key),
        languageCode: langCode,
        originalKey: key,
        destinationValue: value,
      };

      await this.languageValueRepository.create(languageValue);
      this.logger.log(
        `Inserted new translation: ${langCode} - ${key} = ${value}`
      );
    } catch (error) {
      this.logger.error(`Error inserting translation: ${key}`, error);
    }
  }

  async updateTranslation(id: number, value: string): Promise<void> {
    try {
      await this.languageValueRepository.update(id, {
        destinationValue: value,
      });
      this.logger.log(`Updated translation ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error updating translation ID: ${id}`, error);
    }
  }

  async deleteTranslation(id: number): Promise<void> {
    try {
      await this.languageValueRepository.delete(id);
      this.logger.log(`Deleted translation ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting translation ID: ${id}`, error);
    }
  }

  private normalizeLangCode(langCode: string, defaultLang = "en"): string {
    return !langCode ? defaultLang : langCode.toLowerCase().trim();
  }

  private normalizeKey(key: string, defaultKey = ""): string {
    return !key ? defaultKey : key.trim();
  }

  private md5(str: string): string {
    return crypto.createHash("md5").update(str).digest("hex");
  }

  private async getLanguageCodes(langCode: string): Promise<string[]> {
    const languageCodes = [langCode];
    const languages = await this.languageRepository.findAll();

    languages.forEach((language) => {
      if (language.code && language.code !== langCode) {
        languageCodes.push(language.code);
      }
    });

    return languageCodes;
  }

  private async getLanguageValue(langCode: string, key: string): Promise<any> {
    const keyHash = this.md5(key);
    return this.languageValueRepository.findByLanguageAndKey(langCode, keyHash);
  }

  private async isCacheEnabled(): Promise<boolean> {
    // This could be from configuration or database setting
    // For now, return true as default
    return true;
  }
}
