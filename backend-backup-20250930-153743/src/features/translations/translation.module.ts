import { Module } from "@nestjs/common";
import { PersistenceModule } from "../../infrastructure/persistence/persistence.module";

import { TranslationController } from "./controllers/translation.controller";
import { LanguageValueRepository } from "./repositories/language-value.repository";
import { LanguageRepository } from "./repositories/language.repository";
import { CacheService } from "./services/cache.service";
import { DictionaryService } from "./services/dictionary.service";
import { TranslateCacheService } from "./services/translate-cache.service";

@Module({
  imports: [PersistenceModule],
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
