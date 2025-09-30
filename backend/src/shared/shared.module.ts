import { Module } from '@nestjs/common'
import { PasswordService } from './password.service'
import { TokenService } from './token.service'
import { DomainEventBus } from './events/domain-event.bus'
import { StorageService } from './services/storage.service'

@Module({
  providers: [PasswordService, TokenService, DomainEventBus, StorageService],
  exports: [PasswordService, TokenService, DomainEventBus, StorageService],
})
export class SharedModule {}
