import { Module } from '@nestjs/common'
import { PasswordService } from './password.service'
import { TokenService } from './token.service'
import { DomainEventBus } from './events/domain-event.bus'

@Module({
  providers: [PasswordService, TokenService, DomainEventBus],
  exports: [PasswordService, TokenService, DomainEventBus],
})
export class SharedModule {}
