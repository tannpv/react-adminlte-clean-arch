import { Module } from '@nestjs/common'
import { PasswordService } from './password.service'
import { TokenService } from './token.service'

@Module({
  providers: [PasswordService, TokenService],
  exports: [PasswordService, TokenService],
})
export class SharedModule {}
