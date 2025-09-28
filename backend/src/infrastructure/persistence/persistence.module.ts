import { Module } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../../domain/repositories/category.repository";
import { FILE_DIRECTORY_REPOSITORY } from "../../domain/repositories/file-directory.repository";
import { FILE_GRANT_REPOSITORY } from "../../domain/repositories/file-grant.repository";
import { FILE_REPOSITORY } from "../../domain/repositories/file.repository";
import { LANGUAGE_REPOSITORY } from "../../domain/repositories/language.repository";
import { PRODUCT_REPOSITORY } from "../../domain/repositories/product.repository";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository";
import {
  TRANSLATION_KEY_REPOSITORY,
  TRANSLATION_NAMESPACE_REPOSITORY,
  TRANSLATION_REPOSITORY,
} from "../../domain/repositories/translation.repository";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository";
import { SharedModule } from "../../shared/shared.module";
import { MysqlCategoryRepository } from "./mysql/mysql-category.repository";
import { MysqlDatabaseService } from "./mysql/mysql-database.service";
import { MysqlFileDirectoryRepository } from "./mysql/mysql-file-directory.repository";
import { MysqlFileGrantRepository } from "./mysql/mysql-file-grant.repository";
import { MysqlFileRepository } from "./mysql/mysql-file.repository";
import { MysqlLanguageRepository } from "./mysql/mysql-language.repository";
import { MysqlProductRepository } from "./mysql/mysql-product.repository";
import { MysqlRoleRepository } from "./mysql/mysql-role.repository";
import {
  MysqlTranslationKeyRepository,
  MysqlTranslationNamespaceRepository,
  MysqlTranslationRepository,
} from "./mysql/mysql-translation.repository";
import { MysqlUserRepository } from "./mysql/mysql-user.repository";

@Module({
  imports: [SharedModule],
  providers: [
    MysqlDatabaseService,
    { provide: USER_REPOSITORY, useClass: MysqlUserRepository },
    { provide: ROLE_REPOSITORY, useClass: MysqlRoleRepository },
    { provide: PRODUCT_REPOSITORY, useClass: MysqlProductRepository },
    { provide: CATEGORY_REPOSITORY, useClass: MysqlCategoryRepository },
    { provide: LANGUAGE_REPOSITORY, useClass: MysqlLanguageRepository },
    { provide: TRANSLATION_REPOSITORY, useClass: MysqlTranslationRepository },
    {
      provide: TRANSLATION_KEY_REPOSITORY,
      useClass: MysqlTranslationKeyRepository,
    },
    {
      provide: TRANSLATION_NAMESPACE_REPOSITORY,
      useClass: MysqlTranslationNamespaceRepository,
    },
    {
      provide: FILE_DIRECTORY_REPOSITORY,
      useClass: MysqlFileDirectoryRepository,
    },
    { provide: FILE_REPOSITORY, useClass: MysqlFileRepository },
    { provide: FILE_GRANT_REPOSITORY, useClass: MysqlFileGrantRepository },
  ],
  exports: [
    MysqlDatabaseService,
    USER_REPOSITORY,
    ROLE_REPOSITORY,
    PRODUCT_REPOSITORY,
    CATEGORY_REPOSITORY,
    LANGUAGE_REPOSITORY,
    TRANSLATION_REPOSITORY,
    TRANSLATION_KEY_REPOSITORY,
    TRANSLATION_NAMESPACE_REPOSITORY,
    FILE_DIRECTORY_REPOSITORY,
    FILE_REPOSITORY,
    FILE_GRANT_REPOSITORY,
  ],
})
export class PersistenceModule {}
