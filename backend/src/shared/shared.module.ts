import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PasswordService } from './password.service'
import { TokenService } from './token.service'
import { DomainEventBus } from './events/domain-event.bus'
import { JWT_CONFIG, PASSWORD_CONFIG } from './config'
import { DEFAULT_JWT_SECRET } from './constants'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PASSWORD_CONFIG,
      useFactory: (config: ConfigService) => ({
        saltRounds: Number(config.get('BCRYPT_SALT_ROUNDS') ?? 10),
      }),
      inject: [ConfigService],
    },
    {
      provide: JWT_CONFIG,
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') ?? DEFAULT_JWT_SECRET,
        expiresIn: config.get('JWT_EXPIRES_IN') ?? '1h',
      }),
      inject: [ConfigService],
    },
    PasswordService,
    TokenService,
    DomainEventBus,
  ],
  exports: [PasswordService, TokenService, DomainEventBus],
})
export class SharedModule {}
