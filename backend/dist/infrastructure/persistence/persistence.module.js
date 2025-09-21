"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistenceModule = void 0;
const common_1 = require("@nestjs/common");
const category_repository_1 = require("../../domain/repositories/category.repository");
const file_directory_repository_1 = require("../../domain/repositories/file-directory.repository");
const file_grant_repository_1 = require("../../domain/repositories/file-grant.repository");
const file_repository_1 = require("../../domain/repositories/file.repository");
const product_repository_1 = require("../../domain/repositories/product.repository");
const role_repository_1 = require("../../domain/repositories/role.repository");
const user_repository_1 = require("../../domain/repositories/user.repository");
const shared_module_1 = require("../../shared/shared.module");
const mysql_category_repository_1 = require("./mysql/mysql-category.repository");
const mysql_database_service_1 = require("./mysql/mysql-database.service");
const mysql_file_directory_repository_1 = require("./mysql/mysql-file-directory.repository");
const mysql_file_grant_repository_1 = require("./mysql/mysql-file-grant.repository");
const mysql_file_repository_1 = require("./mysql/mysql-file.repository");
const mysql_product_repository_1 = require("./mysql/mysql-product.repository");
const mysql_role_repository_1 = require("./mysql/mysql-role.repository");
const mysql_user_repository_1 = require("./mysql/mysql-user.repository");
let PersistenceModule = class PersistenceModule {
};
exports.PersistenceModule = PersistenceModule;
exports.PersistenceModule = PersistenceModule = __decorate([
    (0, common_1.Module)({
        imports: [shared_module_1.SharedModule],
        providers: [
            mysql_database_service_1.MysqlDatabaseService,
            { provide: user_repository_1.USER_REPOSITORY, useClass: mysql_user_repository_1.MysqlUserRepository },
            { provide: role_repository_1.ROLE_REPOSITORY, useClass: mysql_role_repository_1.MysqlRoleRepository },
            { provide: product_repository_1.PRODUCT_REPOSITORY, useClass: mysql_product_repository_1.MysqlProductRepository },
            { provide: category_repository_1.CATEGORY_REPOSITORY, useClass: mysql_category_repository_1.MysqlCategoryRepository },
            {
                provide: file_directory_repository_1.FILE_DIRECTORY_REPOSITORY,
                useClass: mysql_file_directory_repository_1.MysqlFileDirectoryRepository,
            },
            { provide: file_repository_1.FILE_REPOSITORY, useClass: mysql_file_repository_1.MysqlFileRepository },
            { provide: file_grant_repository_1.FILE_GRANT_REPOSITORY, useClass: mysql_file_grant_repository_1.MysqlFileGrantRepository },
        ],
        exports: [
            user_repository_1.USER_REPOSITORY,
            role_repository_1.ROLE_REPOSITORY,
            product_repository_1.PRODUCT_REPOSITORY,
            category_repository_1.CATEGORY_REPOSITORY,
            file_directory_repository_1.FILE_DIRECTORY_REPOSITORY,
            file_repository_1.FILE_REPOSITORY,
            file_grant_repository_1.FILE_GRANT_REPOSITORY,
        ],
    })
], PersistenceModule);
//# sourceMappingURL=persistence.module.js.map