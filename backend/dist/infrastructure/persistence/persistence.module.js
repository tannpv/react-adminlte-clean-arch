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
const mysql_database_service_1 = require("./mysql/mysql-database.service");
const mysql_user_repository_1 = require("./mysql/mysql-user.repository");
const mysql_role_repository_1 = require("./mysql/mysql-role.repository");
const user_repository_1 = require("../../domain/repositories/user.repository");
const role_repository_1 = require("../../domain/repositories/role.repository");
const shared_module_1 = require("../../shared/shared.module");
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
        ],
        exports: [user_repository_1.USER_REPOSITORY, role_repository_1.ROLE_REPOSITORY],
    })
], PersistenceModule);
//# sourceMappingURL=persistence.module.js.map