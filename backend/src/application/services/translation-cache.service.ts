import { Inject, Injectable } from "@nestjs/common";
import {
  TRANSLATION_REPOSITORY,
  TranslationRepository,
} from "../../domain/repositories/translation.repository";

@Injectable()
export class TranslationCacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @Inject(TRANSLATION_REPOSITORY)
    private readonly translationRepo: TranslationRepository
  ) {}

  // Get translations with caching
  async getTranslations(
    languageCode: string,
    namespace: string
  ): Promise<Record<string, string>> {
    const cacheKey = `${languageCode}:${namespace}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // Fetch from database with optimized query
    const translations = await this.translationRepo.findByLanguageAndNamespace(
      languageCode,
      namespace
    );

    // Cache the result
    this.cache.set(cacheKey, {
      data: translations,
      timestamp: Date.now(),
    });

    return translations;
  }

  // Get single translation with caching
  async getTranslation(
    languageCode: string,
    keyPath: string
  ): Promise<string | null> {
    const cacheKey = `single:${languageCode}:${keyPath}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // Fetch from database
    const translation = await this.translationRepo.findByLanguageAndKeyPath(
      languageCode,
      keyPath
    );

    // Cache the result
    this.cache.set(cacheKey, {
      data: translation,
      timestamp: Date.now(),
    });

    return translation;
  }

  // Clear cache when translations are updated
  clearCache(languageCode?: string, namespace?: string): void {
    if (languageCode && namespace) {
      // Clear specific cache entry
      this.cache.delete(`${languageCode}:${namespace}`);
    } else if (languageCode) {
      // Clear all caches for a language
      for (const key of this.cache.keys()) {
        if (
          key.includes(`:${languageCode}:`) ||
          key.startsWith(`${languageCode}:`)
        ) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Warm up cache for frequently used translations
  async warmUpCache(languageCode: string, namespaces: string[]): Promise<void> {
    const promises = namespaces.map((namespace) =>
      this.getTranslations(languageCode, namespace)
    );
    await Promise.all(promises);
  }
}


