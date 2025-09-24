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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const product_entity_1 = require("../../domain/entities/product.entity");
const product_created_event_1 = require("../../domain/events/product-created.event");
const product_removed_event_1 = require("../../domain/events/product-removed.event");
const product_updated_event_1 = require("../../domain/events/product-updated.event");
const category_repository_1 = require("../../domain/repositories/category.repository");
const product_repository_1 = require("../../domain/repositories/product.repository");
const domain_event_bus_1 = require("../../shared/events/domain-event.bus");
const validation_error_1 = require("../../shared/validation-error");
const product_mapper_1 = require("../mappers/product.mapper");
const product_attribute_values_service_1 = require("./product-attribute-values.service");
const product_variants_service_1 = require("./product-variants.service");
let ProductsService = class ProductsService {
    constructor(products, categories, events, productAttributeValuesService, productVariantsService) {
        this.products = products;
        this.categories = categories;
        this.events = events;
        this.productAttributeValuesService = productAttributeValuesService;
        this.productVariantsService = productVariantsService;
    }
    async list(search) {
        const all = await this.products.findAll(search);
        return all.map((product) => (0, product_mapper_1.toProductResponse)(product));
    }
    async findById(id) {
        const product = await this.products.findById(id);
        if (!product)
            throw new common_1.NotFoundException({ message: "Product not found" });
        return (0, product_mapper_1.toProductResponse)(product);
    }
    async getProductAttributeValues(productId) {
        return await this.productAttributeValuesService.findByProductId(productId);
    }
    async create(dto) {
        const sku = dto.sku.trim();
        const name = dto.name.trim();
        await this.ensureSkuUnique(sku);
        const priceCents = this.toPriceCents(dto.price);
        const status = dto.status ?? "draft";
        const type = dto.type ?? "simple";
        const now = new Date();
        const id = await this.products.nextId();
        const categories = await this.resolveCategories(dto.categories);
        const product = new product_entity_1.Product({
            id,
            sku,
            name,
            description: dto.description ?? null,
            priceCents,
            currency: dto.currency.trim().toUpperCase(),
            status,
            metadata: dto.metadata ?? null,
            categories,
            type,
            createdAt: now,
            updatedAt: now,
        });
        const created = await this.products.create(product);
        if (dto.attributeValues) {
            console.log("Saving product attribute values:", dto.attributeValues);
            await this.saveProductAttributeValues(created.id, dto.attributeValues);
        }
        this.events.publish(new product_created_event_1.ProductCreatedEvent(created));
        return (0, product_mapper_1.toProductResponse)(created);
    }
    async update(id, dto) {
        const product = await this.products.findById(id);
        if (!product)
            throw new common_1.NotFoundException({ message: "Product not found" });
        const sku = dto.sku?.trim() ?? product.sku;
        const name = dto.name?.trim() ?? product.name;
        if (sku !== product.sku) {
            await this.ensureSkuUnique(sku);
        }
        const priceCents = dto.price !== undefined
            ? this.toPriceCents(dto.price)
            : product.priceCents;
        const status = dto.status ?? product.status;
        const type = dto.type ?? product.type;
        const now = new Date();
        const categories = dto.categories !== undefined
            ? await this.resolveCategories(dto.categories)
            : product.categories;
        const updatedProduct = new product_entity_1.Product({
            id: product.id,
            sku,
            name,
            description: dto.description ?? product.description,
            priceCents,
            currency: dto.currency?.trim().toUpperCase() ?? product.currency,
            status,
            metadata: dto.metadata ?? product.metadata,
            categories,
            type,
            createdAt: product.createdAt,
            updatedAt: now,
        });
        const updated = await this.products.update(updatedProduct);
        if (dto.attributeValues !== undefined) {
            await this.productAttributeValuesService.removeByProductId(id);
            if (dto.attributeValues && Object.keys(dto.attributeValues).length > 0) {
                await this.saveProductAttributeValues(id, dto.attributeValues);
            }
        }
        this.events.publish(new product_updated_event_1.ProductUpdatedEvent(updated));
        return (0, product_mapper_1.toProductResponse)(updated);
    }
    async remove(id) {
        const product = await this.products.findById(id);
        if (!product)
            throw new common_1.NotFoundException({ message: "Product not found" });
        const removed = await this.products.remove(id);
        if (!removed)
            throw new common_1.NotFoundException({ message: "Product not found" });
        this.events.publish(new product_removed_event_1.ProductRemovedEvent(removed));
        return (0, product_mapper_1.toProductResponse)(removed);
    }
    async ensureSkuUnique(sku) {
        const existing = await this.products.findBySku(sku);
        if (existing) {
            throw (0, validation_error_1.validationException)({
                sku: {
                    code: "SKU_EXISTS",
                    message: "A product with this SKU already exists",
                },
            });
        }
    }
    async resolveCategories(categoryIds) {
        if (!categoryIds || !categoryIds.length)
            return [];
        const categories = await Promise.all(categoryIds.map(async (id) => {
            const category = await this.categories.findById(id);
            if (!category) {
                throw (0, validation_error_1.validationException)({
                    categories: {
                        code: "CATEGORY_NOT_FOUND",
                        message: `Category with ID ${id} not found`,
                    },
                });
            }
            return category;
        }));
        return categories;
    }
    toPriceCents(price) {
        return Math.round(price * 100);
    }
    async saveProductAttributeValues(productId, attributeValues) {
        console.log("saveProductAttributeValues called with:", {
            productId,
            attributeValues,
        });
        try {
            console.log("Deleting all existing attribute values for product:", productId);
            await this.productAttributeValuesService.removeByProductId(productId);
            for (const [attributeId, valueData] of Object.entries(attributeValues)) {
                console.log("Processing attribute:", { attributeId, valueData });
                if (valueData && Object.keys(valueData).length > 0) {
                    if (valueData.attributeValueIds &&
                        Array.isArray(valueData.attributeValueIds) &&
                        valueData.attributeValueIds.length > 0) {
                        for (const attributeValueId of valueData.attributeValueIds) {
                            const createData = {
                                productId,
                                attributeId: parseInt(attributeId),
                                attributeValueId: attributeValueId,
                                valueText: undefined,
                                valueNumber: undefined,
                                valueBoolean: undefined,
                            };
                            console.log("Creating normalized product attribute value:", createData);
                            try {
                                const result = await this.productAttributeValuesService.create(createData);
                                console.log("Successfully created normalized product attribute value:", result);
                            }
                            catch (error) {
                                console.error("Error creating normalized product attribute value:", error);
                                throw error;
                            }
                        }
                    }
                    else if (valueData.valueText ||
                        valueData.valueNumber !== null ||
                        valueData.valueBoolean !== null) {
                        const createData = {
                            productId,
                            attributeId: parseInt(attributeId),
                            attributeValueId: valueData.attributeValueId || undefined,
                            valueText: valueData.valueText || undefined,
                            valueNumber: valueData.valueNumber || undefined,
                            valueBoolean: valueData.valueBoolean || undefined,
                        };
                        console.log("Creating product attribute value:", createData);
                        try {
                            const result = await this.productAttributeValuesService.create(createData);
                            console.log("Successfully created product attribute value:", result);
                        }
                        catch (error) {
                            console.error("Error creating product attribute value:", error);
                            throw error;
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("Error in saveProductAttributeValues:", error);
            throw error;
        }
    }
    async getProductVariants(productId) {
        try {
            return await this.productVariantsService.findByProductId(productId);
        }
        catch (error) {
            console.error("Error getting product variants:", error);
            throw error;
        }
    }
    async advancedSearch(searchDto) {
        try {
            const result = await this.products.advancedSearch(searchDto);
            return {
                products: result.products.map(product => (0, product_mapper_1.toProductResponse)(product)),
                total: result.total,
                page: searchDto.page || 1,
                limit: searchDto.limit || 20,
                totalPages: Math.ceil(result.total / (searchDto.limit || 20)),
                facets: result.facets
            };
        }
        catch (error) {
            console.error("Error in advanced search:", error);
            throw error;
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(product_repository_1.PRODUCT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(category_repository_1.CATEGORY_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, domain_event_bus_1.DomainEventBus,
        product_attribute_values_service_1.ProductAttributeValuesService,
        product_variants_service_1.ProductVariantsService])
], ProductsService);
//# sourceMappingURL=products.service.js.map