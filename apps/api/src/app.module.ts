import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Infrastructure modules
import { DatabaseModule } from './infrastructure/database/database.module';
import { ObservabilityModule } from './infrastructure/observability/observability.module';

// Domain modules
import { CarrierModule } from './modules/carrier/carrier.module';
import { CustomerModule } from './modules/customer/customer.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { UsersModule } from './modules/users/users.module';

// Shared modules
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Infrastructure
    DatabaseModule,
    ObservabilityModule,
    
    // Domain modules
    CarrierModule,
    CustomerModule,
    PricingModule,
    UsersModule,
    
    // Shared
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
