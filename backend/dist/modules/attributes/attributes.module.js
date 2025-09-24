"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesModule = void 0;
const common_1 = require("@nestjs/common");
const attribute_sets_service_1 = require("../../application/services/attribute-sets.service");
const attribute_values_service_1 = require("../../application/services/attribute-values.service");
const attributes_service_1 = require("../../application/services/attributes.service");
const product_attribute_values_service_1 = require("../../application/services/product-attribute-values.service");
const product_variants_service_1 = require("../../application/services/product-variants.service");
const access_control_module_1 = require("../../infrastructure/http/access-control.module");
const shared_module_1 = require("../../shared/shared.module");
const attribute_sets_controller_1 = require("../../infrastructure/http/controllers/attribute-sets.controller");
const attribute_values_controller_1 = require("../../infrastructure/http/controllers/attribute-values.controller");
const attributes_controller_1 = require("../../infrastructure/http/controllers/attributes.controller");
const product_variants_controller_1 = require("../../infrastructure/http/controllers/product-variants.controller");
const attribute_set_assignment_repository_1 = require("../../infrastructure/persistence/mysql/attribute-set-assignment.repository");
const attribute_set_repository_1 = require("../../infrastructure/persistence/mysql/attribute-set.repository");
const attribute_value_repository_1 = require("../../infrastructure/persistence/mysql/attribute-value.repository");
const attribute_repository_1 = require("../../infrastructure/persistence/mysql/attribute.repository");
const product_attribute_value_repository_1 = require("../../infrastructure/persistence/mysql/product-attribute-value.repository");
const product_variant_attribute_value_repository_1 = require("../../infrastructure/persistence/mysql/product-variant-attribute-value.repository");
const product_variant_repository_1 = require("../../infrastructure/persistence/mysql/product-variant.repository");
const persistence_module_1 = require("../../infrastructure/persistence/persistence.module");
let AttributesModule = class AttributesModule {
};
exports.AttributesModule = AttributesModule;
exports.AttributesModule = AttributesModule = __decorate([
    (0, common_1.Module)({
        imports: [persistence_module_1.PersistenceModule, access_control_module_1.AccessControlModule, shared_module_1.SharedModule],
        controllers: [
            attributes_controller_1.AttributesController,
            attribute_values_controller_1.AttributeValuesController,
            attribute_sets_controller_1.AttributeSetsController,
            product_variants_controller_1.ProductVariantsController,
        ],
        providers: [
            attributes_service_1.AttributesService,
            attribute_values_service_1.AttributeValuesService,
            attribute_sets_service_1.AttributeSetsService,
            product_attribute_values_service_1.ProductAttributeValuesService,
            product_variants_service_1.ProductVariantsService,
            {
                provide: "AttributeRepository",
                useClass: attribute_repository_1.MysqlAttributeRepository,
            },
            {
                provide: "AttributeValueRepository",
                useClass: attribute_value_repository_1.MysqlAttributeValueRepository,
            },
            {
                provide: "AttributeSetRepository",
                useClass: attribute_set_repository_1.MysqlAttributeSetRepository,
            },
            {
                provide: "AttributeSetAssignmentRepository",
                useClass: attribute_set_assignment_repository_1.MysqlAttributeSetAssignmentRepository,
            },
            {
                provide: "ProductAttributeValueRepository",
                useClass: product_attribute_value_repository_1.MysqlProductAttributeValueRepository,
            },
            {
                provide: "ProductVariantRepository",
                useClass: product_variant_repository_1.MysqlProductVariantRepository,
            },
            {
                provide: "ProductVariantAttributeValueRepository",
                useClass: product_variant_attribute_value_repository_1.MysqlProductVariantAttributeValueRepository,
            },
        ],
        exports: [
            attributes_service_1.AttributesService,
            attribute_values_service_1.AttributeValuesService,
            attribute_sets_service_1.AttributeSetsService,
            product_attribute_values_service_1.ProductAttributeValuesService,
            product_variants_service_1.ProductVariantsService,
            "AttributeRepository",
            "AttributeValueRepository",
            "AttributeSetRepository",
            "AttributeSetAssignmentRepository",
            "ProductAttributeValueRepository",
            "ProductVariantRepository",
            "ProductVariantAttributeValueRepository",
        ],
    })
], AttributesModule);
//# sourceMappingURL=attributes.module.js.map