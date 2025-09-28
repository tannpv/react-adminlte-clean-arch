import { Module } from "@nestjs/common";
import { OrdersService } from "../../../application/services/orders.service";
import { COMMISSION_REPOSITORY } from "../../../domain/repositories/commission.repository";
import { ORDER_ITEM_REPOSITORY } from "../../../domain/repositories/order-item.repository";
import { PARENT_ORDER_REPOSITORY } from "../../../domain/repositories/parent-order.repository";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository";
import { STORE_ORDER_REPOSITORY } from "../../../domain/repositories/store-order.repository";
import { STORE_REPOSITORY } from "../../../domain/repositories/store.repository";
import { SharedModule } from "../../../shared/shared.module";
import { MysqlCommissionRepository } from "../../persistence/mysql/mysql-commission.repository";
import { MysqlOrderItemRepository } from "../../persistence/mysql/mysql-order-item.repository";
import { MysqlParentOrderRepository } from "../../persistence/mysql/mysql-parent-order.repository";
import { MysqlProductRepository } from "../../persistence/mysql/mysql-product.repository";
import { MysqlStoreOrderRepository } from "../../persistence/mysql/mysql-store-order.repository";
import { MysqlStoreRepository } from "../../persistence/mysql/mysql-store.repository";
import { PersistenceModule } from "../../persistence/persistence.module";
import { AccessControlModule } from "../access-control.module";
import { OrdersController } from "../controllers/orders.controller";

@Module({
  imports: [AccessControlModule, PersistenceModule, SharedModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: PARENT_ORDER_REPOSITORY,
      useClass: MysqlParentOrderRepository,
    },
    {
      provide: STORE_ORDER_REPOSITORY,
      useClass: MysqlStoreOrderRepository,
    },
    {
      provide: ORDER_ITEM_REPOSITORY,
      useClass: MysqlOrderItemRepository,
    },
    {
      provide: COMMISSION_REPOSITORY,
      useClass: MysqlCommissionRepository,
    },
    {
      provide: STORE_REPOSITORY,
      useClass: MysqlStoreRepository,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: MysqlProductRepository,
    },
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
