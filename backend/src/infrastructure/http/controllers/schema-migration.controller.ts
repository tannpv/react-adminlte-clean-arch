import { Controller, Post, UseGuards } from "@nestjs/common";
import { MysqlDatabaseService } from "../../persistence/mysql/mysql-database.service";
import { RequirePermissions } from "../decorators/permissions.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";

@Controller("schema-migration")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SchemaMigrationController {
  constructor(private readonly dbService: MysqlDatabaseService) {}

  @Post("add-normalized-columns")
  @RequirePermissions("admin:manage")
  async addNormalizedColumns() {
    try {
      // Check if column already exists
      const [existingColumn] = await this.dbService.execute(
        "SHOW COLUMNS FROM product_attribute_values LIKE 'attribute_value_id'"
      );

      if (Array.isArray(existingColumn) && existingColumn.length > 0) {
        return {
          success: true,
          message: "Normalized columns already exist",
          timestamp: new Date().toISOString(),
        };
      }

      // Add the attribute_value_id column
      await this.dbService.execute(
        "ALTER TABLE product_attribute_values ADD COLUMN attribute_value_id BIGINT UNSIGNED NULL"
      );

      // Add foreign key constraint
      try {
        await this.dbService.execute(
          "ALTER TABLE product_attribute_values ADD CONSTRAINT fk_pav_attribute_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE"
        );
      } catch (error) {
        console.log("Foreign key constraint might already exist:", error);
      }

      // Add performance indexes
      try {
        await this.dbService.execute(
          "ALTER TABLE product_attribute_values ADD KEY ix_pav_attribute_value (attribute_value_id)"
        );
      } catch (error) {
        console.log("Index ix_pav_attribute_value might already exist:", error);
      }

      try {
        await this.dbService.execute(
          "ALTER TABLE product_attribute_values ADD KEY ix_product_attribute_value (product_id, attribute_id, attribute_value_id)"
        );
      } catch (error) {
        console.log(
          "Index ix_product_attribute_value might already exist:",
          error
        );
      }

      try {
        await this.dbService.execute(
          "ALTER TABLE product_attribute_values ADD KEY ix_attribute_value_product (attribute_value_id, product_id)"
        );
      } catch (error) {
        console.log(
          "Index ix_attribute_value_product might already exist:",
          error
        );
      }

      // Remove unique constraint to allow multiple values per product-attribute
      try {
        await this.dbService.execute(
          "ALTER TABLE product_attribute_values DROP INDEX ux_product_attribute"
        );
      } catch (error) {
        console.log("Unique constraint might not exist:", error);
      }

      return {
        success: true,
        message: "Successfully added normalized schema columns and indexes",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to add normalized columns",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
