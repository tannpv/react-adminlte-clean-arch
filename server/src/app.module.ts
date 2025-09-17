import { Module } from '@nestjs/common'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { RolesModule } from './modules/roles/roles.module'
import { HealthModule } from './modules/health/health.module'

@Module({
  imports: [HealthModule, AuthModule, UsersModule, RolesModule],
})
export class AppModule {}
