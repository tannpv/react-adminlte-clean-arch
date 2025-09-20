import { Module } from '@nestjs/common'
import { ProductsController } from '../../infrastructure/http/controllers/products.controller'
import { ProductAttributesController } from '../../infrastructure/http/controllers/product-attributes.controller'
import { ProductsService } from '../../application/services/products.service'
import { ProductAttributesService } from '../../application/services/product-attributes.service'
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module'
import { SharedModule } from '../../shared/shared.module'
import { AccessControlModule } from '../../infrastructure/http/access-control.module'

@Module({
  imports: [PersistenceModule, SharedModule, AccessControlModule],
  controllers: [ProductsController, ProductAttributesController],
  providers: [ProductsService, ProductAttributesService],
  exports: [ProductsService, ProductAttributesService],
})
export class ProductsModule {}
