import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { LanguageValue } from "../entities/language-value.entity";

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private getLanguageValueKey(languageCode: string, keyHash: string): string {
    return `translation:${languageCode}:${keyHash}`;
  }

  private getLanguageValuesKey(languageCode: string): string {
    return `translations:${languageCode}`;
  }

  async getLanguageValue(
    keyHash: string,
    languageCode: string
  ): Promise<string | null> {
    try {
      const key = this.getLanguageValueKey(languageCode, keyHash);
      const result = await this.redis.get(key);
      return result;
    } catch (error) {
      console.error("Cache get error:", error);
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
      await this.redis.setex(key, ttl, value);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  async insertLanguageValueCache(languageValue: LanguageValue): Promise<void> {
    try {
      const key = this.getLanguageValueKey(
        languageValue.languageCode,
        languageValue.keyHash
      );
      await this.redis.setex(key, 3600, languageValue.destinationValue);
    } catch (error) {
      console.error("Cache insert error:", error);
    }
  }

  async removeLanguageValueCache(languageValue: LanguageValue): Promise<void> {
    try {
      const key = this.getLanguageValueKey(
        languageValue.languageCode,
        languageValue.keyHash
      );
      await this.redis.del(key);
    } catch (error) {
      console.error("Cache remove error:", error);
    }
  }

  async clearLanguageCache(languageCode?: string): Promise<void> {
    try {
      if (languageCode) {
        const pattern = `translation:${languageCode}:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        const pattern = "translation:*";
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  async getCacheStats(): Promise<{ size: number; keys: string[] }> {
    try {
      const pattern = "translation:*";
      const keys = await this.redis.keys(pattern);
      return {
        size: keys.length,
        keys: keys.slice(0, 100), // Return first 100 keys for preview
      };
    } catch (error) {
      console.error("Cache stats error:", error);
      return { size: 0, keys: [] };
    }
  }

  async warmUpCache(
    languageCode: string,
    translations: LanguageValue[]
  ): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();

      translations.forEach((translation) => {
        const key = this.getLanguageValueKey(languageCode, translation.keyHash);
        pipeline.setex(key, 3600, translation.destinationValue);
      });

      await pipeline.exec();
    } catch (error) {
      console.error("Cache warm up error:", error);
    }
  }
}
