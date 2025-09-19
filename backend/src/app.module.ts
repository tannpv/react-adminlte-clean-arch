import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { RolesModule } from './modules/roles/roles.module'
import { ProductsModule } from './modules/products/products.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { HealthModule } from './modules/health/health.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }), HealthModule, AuthModule, UsersModule, RolesModule, CategoriesModule, ProductsModule],
})
export class AppModule {}
