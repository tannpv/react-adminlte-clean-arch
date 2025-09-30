import { Module } from '@nestjs/common'
import { RolesController } from '../../infrastructure/http/controllers/roles.controller'
import { RolesService } from '../../application/services/roles.service'
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module'
import { SharedModule } from '../../shared/shared.module'
import { AccessControlModule } from '../../infrastructure/http/access-control.module'

@Module({
  imports: [PersistenceModule, SharedModule, AccessControlModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
