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
const product_repository_1 = require("../../domain/repositories/product.repository");
const product_entity_1 = require("../../domain/entities/product.entity");
const validation_error_1 = require("../../shared/validation-error");
const domain_event_bus_1 = require("../../shared/events/domain-event.bus");
const product_created_event_1 = require("../../domain/events/product-created.event");
const product_updated_event_1 = require("../../domain/events/product-updated.event");
const product_removed_event_1 = require("../../domain/events/product-removed.event");
const product_mapper_1 = require("../mappers/product.mapper");
const category_repository_1 = require("../../domain/repositories/category.repository");
let ProductsService = class ProductsService {
    constructor(products, categories, events) {
        this.products = products;
        this.categories = categories;
        this.events = events;
    }
    async list() {
        const all = await this.products.findAll();
        return all.map((product) => (0, product_mapper_1.toProductResponse)(product));
    }
    async findById(id) {
        const product = await this.products.findById(id);
        if (!product)
            throw new common_1.NotFoundException({ message: 'Product not found' });
        return (0, product_mapper_1.toProductResponse)(product);
    }
    async create(dto) {
        const sku = dto.sku.trim();
        const name = dto.name.trim();
        await this.ensureSkuUnique(sku);
        const priceCents = this.toPriceCents(dto.price);
        const status = dto.status ?? 'draft';
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
            createdAt: now,
            updatedAt: now,
        });
        const created = await this.products.create(product);
        this.events.publish(new product_created_event_1.ProductCreatedEvent(created));
        return (0, product_mapper_1.toProductResponse)(created);
    }
    async update(id, dto) {
        const product = await this.products.findById(id);
        if (!product)
            throw new common_1.NotFoundException({ message: 'Product not found' });
        if (dto.sku !== undefined) {
            const newSku = dto.sku.trim();
            if (!newSku) {
                throw (0, validation_error_1.validationException)({ sku: { code: 'SKU_REQUIRED', message: 'SKU is required' } });
            }
            if (newSku !== product.sku) {
                await this.ensureSkuUnique(newSku);
            }
            product.sku = newSku;
        }
        if (dto.name !== undefined) {
            const newName = dto.name.trim();
            if (!newName) {
                throw (0, validation_error_1.validationException)({ name: { code: 'NAME_REQUIRED', message: 'Name is required' } });
            }
            product.name = newName;
        }
        if (dto.description !== undefined) {
            product.description = dto.description ?? null;
        }
        if (dto.price !== undefined) {
            product.priceCents = this.toPriceCents(dto.price);
        }
        if (dto.currency !== undefined) {
            const currency = dto.currency.trim().toUpperCase();
            if (!currency) {
                throw (0, validation_error_1.validationException)({ currency: { code: 'CURRENCY_REQUIRED', message: 'Currency is required' } });
            }
            product.currency = currency;
        }
        if (dto.status !== undefined) {
            product.status = dto.status;
        }
        if (dto.metadata !== undefined) {
            product.metadata = dto.metadata ?? null;
        }
        if (dto.categories !== undefined) {
            const categories = await this.resolveCategories(dto.categories);
            product.categories = categories;
        }
        product.updatedAt = new Date();
        const updated = await this.products.update(product);
        this.events.publish(new product_updated_event_1.ProductUpdatedEvent(updated));
        return (0, product_mapper_1.toProductResponse)(updated);
    }
    async remove(id) {
        const removed = await this.products.remove(id);
        if (!removed)
            throw new common_1.NotFoundException({ message: 'Product not found' });
        this.events.publish(new product_removed_event_1.ProductRemovedEvent(removed));
        return (0, product_mapper_1.toProductResponse)(removed);
    }
    async ensureSkuUnique(sku) {
        const existing = await this.products.findBySku(sku);
        if (existing) {
            throw (0, validation_error_1.validationException)({ sku: { code: 'SKU_EXISTS', message: 'SKU already exists' } });
        }
    }
    toPriceCents(price) {
        if (Number.isNaN(price) || !Number.isFinite(price)) {
            throw (0, validation_error_1.validationException)({ price: { code: 'PRICE_INVALID', message: 'Price is invalid' } });
        }
        const cents = Math.round(price * 100);
        if (cents <= 0) {
            throw (0, validation_error_1.validationException)({ price: { code: 'PRICE_INVALID', message: 'Price must be greater than zero' } });
        }
        return cents;
    }
    async resolveCategories(categoryIds) {
        if (!categoryIds || !categoryIds.length)
            return [];
        const uniqueIds = Array.from(new Set(categoryIds.filter((id) => Number.isInteger(id))));
        if (!uniqueIds.length)
            return [];
        const categories = await this.categories.findByIds(uniqueIds);
        const foundIds = new Set(categories.map((category) => category.id));
        const missing = uniqueIds.filter((id) => !foundIds.has(id));
        if (missing.length) {
            throw (0, validation_error_1.validationException)({
                categories: {
                    code: 'CATEGORIES_INVALID',
                    message: 'One or more categories are invalid',
                },
            });
        }
        return categories;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(product_repository_1.PRODUCT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(category_repository_1.CATEGORY_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, domain_event_bus_1.DomainEventBus])
], ProductsService);
//# sourceMappingURL=products.service.js.map