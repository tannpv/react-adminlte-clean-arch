import { Module } from '@nestjs/common'
import { UsersController } from '../../infrastructure/http/controllers/users.controller'
import { UsersService } from '../../application/services/users.service'
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module'
import { SharedModule } from '../../shared/shared.module'
import { AccessControlModule } from '../../infrastructure/http/access-control.module'
import { MeController } from '../../infrastructure/http/controllers/me.controller'
import { RolesModule } from '../roles/roles.module'
import { ValidationModule } from '../../application/validation/validation.module'

@Module({
  imports: [PersistenceModule, SharedModule, AccessControlModule, RolesModule, ValidationModule],
  controllers: [UsersController, MeController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
