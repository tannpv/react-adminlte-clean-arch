import { Module } from '@nestjs/common'
import { PersistenceModule } from '../persistence/persistence.module'
import { SharedModule } from '../../shared/shared.module'
import { AuthorizationService } from '../../application/services/authorization.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { PermissionsGuard } from './guards/permissions.guard'
import { AuthorizationEventsSubscriber } from '../events/authorization-events.subscriber'

@Module({
  imports: [PersistenceModule, SharedModule],
  providers: [AuthorizationService, JwtAuthGuard, PermissionsGuard, AuthorizationEventsSubscriber],
  exports: [AuthorizationService, JwtAuthGuard, PermissionsGuard],
})
export class AccessControlModule {}
