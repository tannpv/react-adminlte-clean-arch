import { Module } from "@nestjs/common";
import { AttributeSetsService } from "../../application/services/attribute-sets.service";
import { AttributeValuesService } from "../../application/services/attribute-values.service";
import { AttributesService } from "../../application/services/attributes.service";
import { AttributeSetsController } from "../../infrastructure/http/controllers/attribute-sets.controller";
import { AttributeValuesController } from "../../infrastructure/http/controllers/attribute-values.controller";
import { AttributesController } from "../../infrastructure/http/controllers/attributes.controller";
import { MysqlAttributeSetAssignmentRepository } from "../../infrastructure/persistence/mysql/attribute-set-assignment.repository";
import { MysqlAttributeSetRepository } from "../../infrastructure/persistence/mysql/attribute-set.repository";
import { MysqlAttributeValueRepository } from "../../infrastructure/persistence/mysql/attribute-value.repository";
import { MysqlAttributeRepository } from "../../infrastructure/persistence/mysql/attribute.repository";
import { PersistenceModule } from "../../infrastructure/persistence/persistence.module";

@Module({
  imports: [PersistenceModule],
  controllers: [
    AttributesController,
    AttributeValuesController,
    AttributeSetsController,
  ],
  providers: [
    AttributesService,
    AttributeValuesService,
    AttributeSetsService,
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
  ],
  exports: [
    AttributesService,
    AttributeValuesService,
    AttributeSetsService,
    "AttributeRepository",
    "AttributeValueRepository",
    "AttributeSetRepository",
    "AttributeSetAssignmentRepository",
  ],
})
export class AttributesModule {}
