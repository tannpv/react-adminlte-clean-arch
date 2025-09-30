import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TranslationModule } from "./features/translations/translation.module";
import { OrdersModule } from "./infrastructure/http/modules/orders.module";
import { StoresModule } from "./infrastructure/http/modules/stores.module";
import { AttributesModule } from "./modules/attributes/attributes.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { HealthModule } from "./modules/health/health.module";
import { ProductsModule } from "./modules/products/products.module";
import { RolesModule } from "./modules/roles/roles.module";
import { StorageModule } from "./modules/storage/storage.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../.env"] }),
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    ProductsModule,
    StorageModule,
    AttributesModule,
    StoresModule,
    OrdersModule,
    TranslationModule,
  ],
})
export class AppModule {}
