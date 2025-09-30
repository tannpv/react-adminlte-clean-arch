import { Module } from "@nestjs/common";
import { StoresService } from "../../../application/services/stores.service";
import { STORE_REPOSITORY } from "../../../domain/repositories/store.repository";
import { SharedModule } from "../../../shared/shared.module";
import { MysqlStoreRepository } from "../../persistence/mysql/mysql-store.repository";
import { PersistenceModule } from "../../persistence/persistence.module";
import { AccessControlModule } from "../access-control.module";
import { StoresController } from "../controllers/stores.controller";

@Module({
  imports: [AccessControlModule, PersistenceModule, SharedModule],
  controllers: [StoresController],
  providers: [
    StoresService,
    {
      provide: STORE_REPOSITORY,
      useClass: MysqlStoreRepository,
    },
  ],
  exports: [StoresService],
})
export class StoresModule {}
