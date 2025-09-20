import { Module } from '@nestjs/common'
import { MysqlDatabaseService } from './mysql/mysql-database.service'
import { MysqlUserRepository } from './mysql/mysql-user.repository'
import { MysqlRoleRepository } from './mysql/mysql-role.repository'
import { MysqlProductRepository } from './mysql/mysql-product.repository'
import { MysqlProductAttributeRepository } from './mysql/mysql-product-attribute.repository'
import { MysqlCategoryRepository } from './mysql/mysql-category.repository'
import { MysqlFileDirectoryRepository } from './mysql/mysql-file-directory.repository'
import { MysqlFileRepository } from './mysql/mysql-file.repository'
import { MysqlFileGrantRepository } from './mysql/mysql-file-grant.repository'
import { USER_REPOSITORY } from '../../domain/repositories/user.repository'
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository'
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository'
import { PRODUCT_ATTRIBUTE_REPOSITORY } from '../../domain/repositories/product-attribute.repository'
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository'
import { FILE_DIRECTORY_REPOSITORY } from '../../domain/repositories/file-directory.repository'
import { FILE_REPOSITORY } from '../../domain/repositories/file.repository'
import { FILE_GRANT_REPOSITORY } from '../../domain/repositories/file-grant.repository'
import { SharedModule } from '../../shared/shared.module'

@Module({
  imports: [SharedModule],
  providers: [
    MysqlDatabaseService,
    { provide: USER_REPOSITORY, useClass: MysqlUserRepository },
    { provide: ROLE_REPOSITORY, useClass: MysqlRoleRepository },
    { provide: PRODUCT_REPOSITORY, useClass: MysqlProductRepository },
    { provide: PRODUCT_ATTRIBUTE_REPOSITORY, useClass: MysqlProductAttributeRepository },
    { provide: CATEGORY_REPOSITORY, useClass: MysqlCategoryRepository },
    { provide: FILE_DIRECTORY_REPOSITORY, useClass: MysqlFileDirectoryRepository },
    { provide: FILE_REPOSITORY, useClass: MysqlFileRepository },
    { provide: FILE_GRANT_REPOSITORY, useClass: MysqlFileGrantRepository },
  ],
  exports: [
    USER_REPOSITORY,
    ROLE_REPOSITORY,
    PRODUCT_REPOSITORY,
    PRODUCT_ATTRIBUTE_REPOSITORY,
    CATEGORY_REPOSITORY,
    FILE_DIRECTORY_REPOSITORY,
    FILE_REPOSITORY,
    FILE_GRANT_REPOSITORY,
  ],
})
export class PersistenceModule {}
