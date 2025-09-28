import { Module } from "@nestjs/common";
import { TranslationCacheService } from "../../application/services/translation-cache.service";
import { TranslationService } from "../../application/services/translation.service";
import { AccessControlModule } from "../../infrastructure/http/access-control.module";
import { TranslationController } from "../../infrastructure/http/controllers/translation.controller";
import { PersistenceModule } from "../../infrastructure/persistence/persistence.module";
import { SharedModule } from "../../shared/shared.module";

@Module({
  imports: [PersistenceModule, AccessControlModule, SharedModule],
  controllers: [TranslationController],
  providers: [TranslationService, TranslationCacheService],
  exports: [TranslationService, TranslationCacheService],
})
export class TranslationsModule {}


