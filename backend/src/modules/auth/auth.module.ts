import { Module } from '@nestjs/common'
import { AuthController } from '../../infrastructure/http/controllers/auth.controller'
import { AuthService } from '../../application/services/auth.service'
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module'
import { SharedModule } from '../../shared/shared.module'

@Module({
  imports: [PersistenceModule, SharedModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
