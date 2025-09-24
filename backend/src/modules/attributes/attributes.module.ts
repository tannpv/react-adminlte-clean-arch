import { Module } from "@nestjs/common";
import { AttributeSetsService } from "../../application/services/attribute-sets.service";
import { AttributeValuesService } from "../../application/services/attribute-values.service";
import { AttributesService } from "../../application/services/attributes.service";
import { ProductAttributeValuesService } from "../../application/services/product-attribute-values.service";
import { ProductVariantsService } from "../../application/services/product-variants.service";
import { AttributeSetsController } from "../../infrastructure/http/controllers/attribute-sets.controller";
import { AttributeValuesController } from "../../infrastructure/http/controllers/attribute-values.controller";
import { AttributesController } from "../../infrastructure/http/controllers/attributes.controller";
import { ProductVariantsController } from "../../infrastructure/http/controllers/product-variants.controller";
import { MysqlAttributeSetAssignmentRepository } from "../../infrastructure/persistence/mysql/attribute-set-assignment.repository";
import { MysqlAttributeSetRepository } from "../../infrastructure/persistence/mysql/attribute-set.repository";
import { MysqlAttributeValueRepository } from "../../infrastructure/persistence/mysql/attribute-value.repository";
import { MysqlAttributeRepository } from "../../infrastructure/persistence/mysql/attribute.repository";
import { MysqlProductAttributeValueRepository } from "../../infrastructure/persistence/mysql/product-attribute-value.repository";
import { MysqlProductVariantAttributeValueRepository } from "../../infrastructure/persistence/mysql/product-variant-attribute-value.repository";
import { MysqlProductVariantRepository } from "../../infrastructure/persistence/mysql/product-variant.repository";
import { PersistenceModule } from "../../infrastructure/persistence/persistence.module";

@Module({
  imports: [PersistenceModule],
  controllers: [
    AttributesController,
    AttributeValuesController,
    AttributeSetsController,
    ProductVariantsController,
  ],
  providers: [
    AttributesService,
    AttributeValuesService,
    AttributeSetsService,
    ProductAttributeValuesService,
    ProductVariantsService,
    {
      provide: "AttributeRepository",
      useClass: MysqlAttributeRepository,
    },
    {
      provide: "AttributeValueRepository",
      useClass: MysqlAttributeValueRepository,
    },
    {
      provide: "AttributeSetRepository",
      useClass: MysqlAttributeSetRepository,
    },
    {
      provide: "AttributeSetAssignmentRepository",
      useClass: MysqlAttributeSetAssignmentRepository,
    },
    {
      provide: "ProductAttributeValueRepository",
      useClass: MysqlProductAttributeValueRepository,
    },
    {
      provide: "ProductVariantRepository",
      useClass: MysqlProductVariantRepository,
    },
    {
      provide: "ProductVariantAttributeValueRepository",
      useClass: MysqlProductVariantAttributeValueRepository,
    },
  ],
  exports: [
    AttributesService,
    AttributeValuesService,
    AttributeSetsService,
    ProductAttributeValuesService,
    ProductVariantsService,
    "AttributeRepository",
    "AttributeValueRepository",
    "AttributeSetRepository",
    "AttributeSetAssignmentRepository",
    "ProductAttributeValueRepository",
    "ProductVariantRepository",
    "ProductVariantAttributeValueRepository",
  ],
})
export class AttributesModule {}
