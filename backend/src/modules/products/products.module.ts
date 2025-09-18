import { Module } from '@nestjs/common'
import { ProductsController } from '../../infrastructure/http/controllers/products.controller'
import { ProductsService } from '../../application/services/products.service'
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module'
import { SharedModule } from '../../shared/shared.module'
import { AccessControlModule } from '../../infrastructure/http/access-control.module'

@Module({
  imports: [PersistenceModule, SharedModule, AccessControlModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
