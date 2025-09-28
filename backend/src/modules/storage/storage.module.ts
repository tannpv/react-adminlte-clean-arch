import { Module } from '@nestjs/common'
import { FileManagerController } from '../../infrastructure/http/controllers/file-manager.controller'
import { FileManagerService } from '../../application/services/file-manager.service'
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module'
import { SharedModule } from '../../shared/shared.module'
import { AccessControlModule } from '../../infrastructure/http/access-control.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [PersistenceModule, SharedModule, AccessControlModule, UsersModule],
  controllers: [FileManagerController],
  providers: [FileManagerService],
  exports: [FileManagerService],
})
export class StorageModule {}

