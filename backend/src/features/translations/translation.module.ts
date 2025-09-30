import { RedisModule } from "@nestjs-modules/ioredis";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TranslationController } from "./controllers/translation.controller";
import { LanguageValue } from "./entities/language-value.entity";
import { Language } from "./entities/language.entity";
import { LanguageValueRepository } from "./repositories/language-value.repository";
import { LanguageRepository } from "./repositories/language.repository";
import { CacheService } from "./services/cache.service";
import { DictionaryService } from "./services/dictionary.service";
import { TranslateCacheService } from "./services/translate-cache.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Language, LanguageValue]),
    RedisModule.forRoot({
      type: "single",
      url: process.env.REDIS_URL || "redis://localhost:6379",
    }),
  ],
  controllers: [TranslationController],
  providers: [
    LanguageRepository,
    LanguageValueRepository,
    DictionaryService,
    TranslateCacheService,
    CacheService,
  ],
  exports: [
    DictionaryService,
    TranslateCacheService,
    CacheService,
    LanguageRepository,
    LanguageValueRepository,
  ],
})
export class TranslationModule {}
