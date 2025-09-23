"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaMigrationModule = void 0;
const common_1 = require("@nestjs/common");
const schema_migration_controller_1 = require("../../infrastructure/http/controllers/schema-migration.controller");
const persistence_module_1 = require("../../infrastructure/persistence/persistence.module");
let SchemaMigrationModule = class SchemaMigrationModule {
};
exports.SchemaMigrationModule = SchemaMigrationModule;
exports.SchemaMigrationModule = SchemaMigrationModule = __decorate([
    (0, common_1.Module)({
        imports: [persistence_module_1.PersistenceModule],
        controllers: [schema_migration_controller_1.SchemaMigrationController],
    })
], SchemaMigrationModule);
//# sourceMappingURL=schema-migration.module.js.map