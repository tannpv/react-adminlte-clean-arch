import { Module } from '@nestjs/common'
import { MysqlDatabaseService } from './mysql/mysql-database.service'
import { MysqlUserRepository } from './mysql/mysql-user.repository'
import { MysqlRoleRepository } from './mysql/mysql-role.repository'
import { MysqlProductRepository } from './mysql/mysql-product.repository'
import { USER_REPOSITORY } from '../../domain/repositories/user.repository'
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository'
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository'
import { SharedModule } from '../../shared/shared.module'

@Module({
  imports: [SharedModule],
  providers: [
    MysqlDatabaseService,
    { provide: USER_REPOSITORY, useClass: MysqlUserRepository },
    { provide: ROLE_REPOSITORY, useClass: MysqlRoleRepository },
    { provide: PRODUCT_REPOSITORY, useClass: MysqlProductRepository },
  ],
  exports: [USER_REPOSITORY, ROLE_REPOSITORY, PRODUCT_REPOSITORY],
})
export class PersistenceModule {}
