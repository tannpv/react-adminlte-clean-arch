import { Module } from '@nestjs/common'
import { CategoriesController } from '../../infrastructure/http/controllers/categories.controller'
import { CategoriesService } from '../../application/services/categories.service'
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module'
import { SharedModule } from '../../shared/shared.module'
import { AccessControlModule } from '../../infrastructure/http/access-control.module'

@Module({
  imports: [PersistenceModule, SharedModule, AccessControlModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

