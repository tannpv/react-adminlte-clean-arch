import { Module } from "@nestjs/common";
import { PersistenceModule } from "../../infrastructure/persistence/persistence.module";
import { UserUpdateValidationService } from "./user-update-validation.service";
import { UserValidationService } from "./user-validation.service";

@Module({
  imports: [PersistenceModule],
  providers: [UserValidationService, UserUpdateValidationService],
  exports: [UserValidationService, UserUpdateValidationService],
})
export class ValidationModule {}
