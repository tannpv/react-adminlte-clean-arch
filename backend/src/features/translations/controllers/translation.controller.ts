import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { LanguageValueRepository } from "../repositories/language-value.repository";
import { LanguageRepository } from "../repositories/language.repository";
import { CacheService } from "../services/cache.service";
import { DictionaryService } from "../services/dictionary.service";
import { TranslateCacheService } from "../services/translate-cache.service";

@Controller("translations")
export class TranslationController {
  constructor(
    private readonly translateCacheService: TranslateCacheService,
    private readonly dictionaryService: DictionaryService,
    private readonly languageRepository: LanguageRepository,
    private readonly languageValueRepository: LanguageValueRepository,
    private readonly cacheService: CacheService
  ) {}

  @Get("translate/:key")
  async translate(@Param("key") key: string): Promise<{ translation: string }> {
    try {
      const translation = await this.translateCacheService.get(
        decodeURIComponent(key)
      );
      return { translation };
    } catch (error) {
      throw new HttpException(
        `Translation failed for key: ${key}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("translate/format")
  async translateWithFormat(
    @Body() body: { text: string; params: any[] }
  ): Promise<{ translation: string }> {
    try {
      const translation = await this.translateCacheService.getWithFormat(
        body.text,
        ...body.params
      );
      return { translation };
    } catch (error) {
      throw new HttpException(
        `Translation with format failed for text: ${body.text}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("translate/array")
  async translateArray(
    @Body() body: { [key: string]: string }
  ): Promise<{ [key: string]: string }> {
    try {
      const translation = await this.translateCacheService.translate2DArray(
        body
      );
      return translation;
    } catch (error) {
      throw new HttpException(
        "Array translation failed",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("refresh")
  async refresh(
    @Body() body: { languageCode?: string; key?: string }
  ): Promise<{ message: string }> {
    try {
      await this.translateCacheService.refresh(body.languageCode, body.key);
      return { message: "Translation cache refreshed successfully" };
    } catch (error) {
      throw new HttpException(
        "Failed to refresh translation cache",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("languages")
  async getLanguages(): Promise<any[]> {
    try {
      const languages = await this.languageRepository.findAll();
      return languages.map((lang) => ({
        id: lang.id,
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        isDefault: lang.isDefault,
        isActive: lang.isActive,
      }));
    } catch (error) {
      throw new HttpException(
        "Failed to fetch languages",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("languages/:code/translations")
  async getTranslationsByLanguage(@Param("code") code: string): Promise<any[]> {
    try {
      const translations = await this.languageValueRepository.findAllByLanguage(
        code
      );
      return translations.map((trans) => ({
        id: trans.id,
        keyHash: trans.keyHash,
        originalKey: trans.originalKey,
        destinationValue: trans.destinationValue,
        languageCode: trans.languageCode,
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch translations for language: ${code}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("languages")
  async createLanguage(@Body() body: any): Promise<any> {
    try {
      const language = await this.languageRepository.create(body);
      return {
        id: language.id,
        code: language.code,
        name: language.name,
        nativeName: language.nativeName,
        isDefault: language.isDefault,
        isActive: language.isActive,
      };
    } catch (error) {
      throw new HttpException(
        "Failed to create language",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("translations")
  async createTranslation(@Body() body: any): Promise<any> {
    try {
      await this.dictionaryService.insert(
        body.languageCode,
        body.originalKey,
        body.destinationValue
      );
      return { message: "Translation created successfully" };
    } catch (error) {
      throw new HttpException(
        "Failed to create translation",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("cache/clear")
  async clearCache(
    @Body() body: { languageCode?: string }
  ): Promise<{ message: string }> {
    try {
      await this.cacheService.clearLanguageCache(body.languageCode);
      return { message: "Cache cleared successfully" };
    } catch (error) {
      throw new HttpException(
        "Failed to clear cache",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("cache/stats")
  async getCacheStats(): Promise<any> {
    try {
      const stats = await this.cacheService.getCacheStats();
      return stats;
    } catch (error) {
      throw new HttpException(
        "Failed to get cache stats",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("cache/warmup")
  async warmUpCache(
    @Body() body: { languageCode: string }
  ): Promise<{ message: string }> {
    try {
      const translations = await this.languageValueRepository.findAllByLanguage(
        body.languageCode
      );
      await this.cacheService.warmUpCache(body.languageCode, translations);
      return { message: "Cache warmed up successfully" };
    } catch (error) {
      throw new HttpException(
        "Failed to warm up cache",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
