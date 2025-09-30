import { Module } from "@nestjs/common";
import { UsersService } from "../../application/services/users.service";
import { ValidationModule } from "../../application/validation/validation.module";
import { AccessControlModule } from "../../infrastructure/http/access-control.module";
import { MeController } from "../../infrastructure/http/controllers/me.controller";
import { UsersController } from "../../infrastructure/http/controllers/users.controller";
import { PersistenceModule } from "../../infrastructure/persistence/persistence.module";
import { SharedModule } from "../../shared/shared.module";
import { RolesModule } from "../roles/roles.module";

@Module({
  imports: [
    PersistenceModule,
    SharedModule,
    AccessControlModule,
    RolesModule,
    ValidationModule,
  ],
  controllers: [UsersController, MeController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
