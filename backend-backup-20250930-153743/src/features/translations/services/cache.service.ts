import { Injectable, Logger } from "@nestjs/common";
import { LanguageValue } from "../entities/language-value.entity";

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, { value: string; expiry: number }>();
  private readonly TTL = 3600000; // 1 hour in milliseconds

  private getLanguageValueKey(languageCode: string, keyHash: string): string {
    return `translation:${languageCode}:${keyHash}`;
  }

  async getLanguageValue(
    keyHash: string,
    languageCode: string
  ): Promise<string | null> {
    try {
      const key = this.getLanguageValueKey(languageCode, keyHash);
      const cached = this.cache.get(key);
      
      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      }
      
      // Remove expired entry
      if (cached) {
        this.cache.delete(key);
      }
      
      return null;
    } catch (error) {
      this.logger.error("Cache get error:", error);
      return null;
    }
  }

  async setLanguageValue(
    keyHash: string,
    languageCode: string,
    value: string,
    ttl: number = 3600
  ): Promise<void> {
    try {
      const key = this.getLanguageValueKey(languageCode, keyHash);
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(key, { value, expiry });
    } catch (error) {
      this.logger.error("Cache set error:", error);
    }
  }

  async insertLanguageValueCache(languageValue: LanguageValue): Promise<void> {
    try {
      if (!languageValue.languageCode || !languageValue.keyHash || !languageValue.destinationValue) {
        return;
      }
      const key = this.getLanguageValueKey(
        languageValue.languageCode,
        languageValue.keyHash
      );
      const expiry = Date.now() + this.TTL;
      this.cache.set(key, { 
        value: languageValue.destinationValue, 
        expiry 
      });
    } catch (error) {
      this.logger.error("Cache insert error:", error);
    }
  }

  async removeLanguageValueCache(languageValue: LanguageValue): Promise<void> {
    try {
      if (!languageValue.languageCode || !languageValue.keyHash) {
        return;
      }
      const key = this.getLanguageValueKey(
        languageValue.languageCode,
        languageValue.keyHash
      );
      this.cache.delete(key);
    } catch (error) {
      this.logger.error("Cache remove error:", error);
    }
  }

  async clearLanguageCache(languageCode?: string): Promise<void> {
    try {
      if (languageCode) {
        // Clear cache for specific language
        const pattern = `translation:${languageCode}:`;
        for (const key of this.cache.keys()) {
          if (key.startsWith(pattern)) {
            this.cache.delete(key);
          }
        }
      } else {
        // Clear all translation cache
        for (const key of this.cache.keys()) {
          if (key.startsWith('translation:')) {
            this.cache.delete(key);
          }
        }
      }
    } catch (error) {
      this.logger.error("Cache clear error:", error);
    }
  }

  async getCacheStats(): Promise<{ size: number; keys: string[] }> {
    try {
      const keys = Array.from(this.cache.keys()).filter(key => 
        key.startsWith('translation:')
      );
      return {
        size: keys.length,
        keys: keys.slice(0, 100), // Return first 100 keys for preview
      };
    } catch (error) {
      this.logger.error("Cache stats error:", error);
      return { size: 0, keys: [] };
    }
  }

  async warmUpCache(
    languageCode: string,
    translations: LanguageValue[]
  ): Promise<void> {
    try {
      for (const translation of translations) {
        if (!translation.keyHash || !translation.destinationValue) {
          continue;
        }
        const key = this.getLanguageValueKey(languageCode, translation.keyHash);
        const expiry = Date.now() + this.TTL;
        this.cache.set(key, { 
          value: translation.destinationValue, 
          expiry 
        });
      }
    } catch (error) {
      this.logger.error("Cache warm up error:", error);
    }
  }

  // Clean up expired entries periodically
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }

  // Start periodic cleanup
  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }
}