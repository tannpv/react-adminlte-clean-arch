import { Module } from "@nestjs/common";
import { SchemaMigrationController } from "../../infrastructure/http/controllers/schema-migration.controller";
import { PersistenceModule } from "../../infrastructure/persistence/persistence.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PersistenceModule, AuthModule],
  controllers: [SchemaMigrationController],
})
export class SchemaMigrationModule {}
