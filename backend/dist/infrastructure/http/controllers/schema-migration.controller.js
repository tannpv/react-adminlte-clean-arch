"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaMigrationController = void 0;
const common_1 = require("@nestjs/common");
const mysql_database_service_1 = require("../../persistence/mysql/mysql-database.service");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const permissions_guard_1 = require("../guards/permissions.guard");
let SchemaMigrationController = class SchemaMigrationController {
    constructor(dbService) {
        this.dbService = dbService;
    }
    async addNormalizedColumns() {
        try {
            const [existingColumn] = await this.dbService.execute("SHOW COLUMNS FROM product_attribute_values LIKE 'attribute_value_id'");
            if (Array.isArray(existingColumn) && existingColumn.length > 0) {
                return {
                    success: true,
                    message: "Normalized columns already exist",
                    timestamp: new Date().toISOString()
                };
            }
            await this.dbService.execute("ALTER TABLE product_attribute_values ADD COLUMN attribute_value_id BIGINT UNSIGNED NULL");
            try {
                await this.dbService.execute("ALTER TABLE product_attribute_values ADD CONSTRAINT fk_pav_attribute_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE");
            }
            catch (error) {
                console.log("Foreign key constraint might already exist:", error);
            }
            try {
                await this.dbService.execute("ALTER TABLE product_attribute_values ADD KEY ix_pav_attribute_value (attribute_value_id)");
            }
            catch (error) {
                console.log("Index ix_pav_attribute_value might already exist:", error);
            }
            try {
                await this.dbService.execute("ALTER TABLE product_attribute_values ADD KEY ix_product_attribute_value (product_id, attribute_id, attribute_value_id)");
            }
            catch (error) {
                console.log("Index ix_product_attribute_value might already exist:", error);
            }
            try {
                await this.dbService.execute("ALTER TABLE product_attribute_values ADD KEY ix_attribute_value_product (attribute_value_id, product_id)");
            }
            catch (error) {
                console.log("Index ix_attribute_value_product might already exist:", error);
            }
            try {
                await this.dbService.execute("ALTER TABLE product_attribute_values DROP INDEX ux_product_attribute");
            }
            catch (error) {
                console.log("Unique constraint might not exist:", error);
            }
            return {
                success: true,
                message: "Successfully added normalized schema columns and indexes",
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Failed to add normalized columns",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString()
            };
        }
    }
};
exports.SchemaMigrationController = SchemaMigrationController;
__decorate([
    (0, common_1.Post)("add-normalized-columns"),
    (0, permissions_decorator_1.RequirePermissions)("admin:manage"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchemaMigrationController.prototype, "addNormalizedColumns", null);
exports.SchemaMigrationController = SchemaMigrationController = __decorate([
    (0, common_1.Controller)("schema-migration"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [mysql_database_service_1.MysqlDatabaseService])
], SchemaMigrationController);
//# sourceMappingURL=schema-migration.controller.js.map