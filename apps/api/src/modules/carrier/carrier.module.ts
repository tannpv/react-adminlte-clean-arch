import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarrierController } from './api/carrier.controller';
import { CarrierService } from './application/services/carrier.service';
import { Carrier } from './domain/entities/carrier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carrier])],
  controllers: [CarrierController],
  providers: [CarrierService],
  exports: [CarrierService],
})
export class CarrierModule {}
