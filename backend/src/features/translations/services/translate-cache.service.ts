import { Injectable, Logger } from "@nestjs/common";
import { LanguageRepository } from "../repositories/language.repository";
import { DictionaryService } from "./dictionary.service";

@Injectable()
export class TranslateCacheService {
  private static instance: TranslateCacheService;
  private readonly logger = new Logger(TranslateCacheService.name);

  constructor(
    private readonly dictionaryService: DictionaryService,
    private readonly languageRepository: LanguageRepository
  ) {}

  static getInstance(
    dictionaryService: DictionaryService,
    languageRepository: LanguageRepository
  ): TranslateCacheService {
    if (!TranslateCacheService.instance) {
      TranslateCacheService.instance = new TranslateCacheService(
        dictionaryService,
        languageRepository
      );
    }
    return TranslateCacheService.instance;
  }

  async get(key: string, languageCode?: string): Promise<string> {
    try {
      const translateCacheDisable = await this.getSetting(
        "translate.cache.disable",
        "N"
      );
      if (translateCacheDisable === "Y") {
        return key;
      }

      const langCode = languageCode || await this.getLangCode();
      return this.dictionaryService.get(langCode, key);
    } catch (error) {
      this.logger.error(`Error getting translation for key: ${key}`, error);
      return key;
    }
  }

  async getWithFormat(text: string, ...params: any[]): Promise<string> {
    try {
      const translateCacheDisable = await this.getSetting(
        "translate.cache.disable",
        "N"
      );

      if (translateCacheDisable !== "Y") {
        const langCode = await this.getLangCode();
        text = await this.dictionaryService.get(langCode, text);
      }

      const formats = this.getFormats(text);
      if (formats.length === 0) {
        return text;
      }

      const replaceMap: { [key: string]: string } = {};
      formats.forEach((format) => {
        const i = parseInt(format.substring(1, format.length - 1));
        if (i + 1 < params.length) {
          replaceMap[format] = String(params[i + 1]);
        }
      });

      return this.replaceByMap(replaceMap, text);
    } catch (error) {
      this.logger.error(
        `Error formatting translation for text: ${text}`,
        error
      );
      return text;
    }
  }

  async translate2DArray(array: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }> {
    try {
      if (!array || Object.keys(array).length === 0) {
        return array;
      }

      const result: { [key: string]: string } = {};
      for (const [key, value] of Object.entries(array)) {
        result[key] = await this.get(value);
      }
      return result;
    } catch (error) {
      this.logger.error("Error translating array", error);
      return array;
    }
  }

  async refresh(languageCode?: string, key?: string): Promise<void> {
    try {
      if (!languageCode) {
        const langCode = await this.getLangCode();
        return this.dictionaryService.refresh(langCode, key);
      } else {
        return this.dictionaryService.refresh(languageCode.toLowerCase(), key);
      }
    } catch (error) {
      this.logger.error(`Error refreshing translation`, error);
    }
  }

  private async getLangCode(): Promise<string> {
    try {
      // Get from session/context (this would be implemented based on your session management)
      let langCode = await this.getSessionLanguage();
      if (langCode) {
        return langCode;
      }

      // Get default language from database
      langCode = await this.getDefaultLang();
      if (langCode) {
        await this.setSessionLanguage(langCode);
        return langCode;
      }

      // Fallback to config
      langCode = this.getConfigLanguage();
      await this.setSessionLanguage(langCode);
      return langCode;
    } catch (error) {
      this.logger.error("Error getting language code", error);
      return "en";
    }
  }

  private async getSessionLanguage(): Promise<string | null> {
    // This would be implemented based on your session management
    // For now, return null to use default
    return null;
  }

  private async setSessionLanguage(langCode: string): Promise<void> {
    // This would be implemented based on your session management
    // For now, just log
    this.logger.log(`Setting session language to: ${langCode}`);
  }

  private async getDefaultLang(): Promise<string | null> {
    try {
      const language = await this.languageRepository.findDefault();
      return language ? language.code : null;
    } catch (error) {
      this.logger.error("Error getting default language", error);
      return null;
    }
  }

  private getConfigLanguage(): string {
    // This would be from your configuration
    return "en";
  }

  private getFormats(str: string): string[] {
    const pattern = /{[0-9]+}/g;
    const matches = str.match(pattern);
    return matches || [];
  }

  private replaceByMap(
    replaceMap: { [key: string]: string },
    text: string
  ): string {
    let result = text;
    for (const [key, value] of Object.entries(replaceMap)) {
      result = result.replace(new RegExp(this.escapeRegExp(key), "g"), value);
    }
    return result;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private async getSetting(key: string, defaultValue: string): Promise<string> {
    // This would be implemented based on your settings management
    // For now, return default value
    return defaultValue;
  }
}
