import { Module } from '@nestjs/common'
import { PersistenceModule } from '../persistence/persistence.module'
import { SharedModule } from '../../shared/shared.module'
import { AuthorizationService } from '../../application/services/authorization.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { PermissionsGuard } from './guards/permissions.guard'

@Module({
  imports: [PersistenceModule, SharedModule],
  providers: [AuthorizationService, JwtAuthGuard, PermissionsGuard],
  exports: [AuthorizationService, JwtAuthGuard, PermissionsGuard],
})
export class AccessControlModule {}
