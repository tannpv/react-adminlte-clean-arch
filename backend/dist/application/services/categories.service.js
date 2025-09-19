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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const category_repository_1 = require("../../domain/repositories/category.repository");
const category_entity_1 = require("../../domain/entities/category.entity");
const validation_error_1 = require("../../shared/validation-error");
let CategoriesService = class CategoriesService {
    constructor(categories) {
        this.categories = categories;
    }
    async list() {
        const categories = await this.categories.findAll();
        return categories.map((category) => this.toResponse(category));
    }
    async create(dto) {
        const name = dto.name.trim();
        if (!name) {
            throw (0, validation_error_1.validationException)({ name: { code: 'NAME_REQUIRED', message: 'Name is required' } });
        }
        const existing = await this.categories.findByName(name);
        if (existing) {
            throw (0, validation_error_1.validationException)({ name: { code: 'NAME_EXISTS', message: 'Category name already exists' } });
        }
        const id = await this.categories.nextId();
        const category = new category_entity_1.Category(id, name);
        const created = await this.categories.create(category);
        return this.toResponse(created);
    }
    async update(id, dto) {
        const category = await this.categories.findById(id);
        if (!category)
            throw new common_1.NotFoundException({ message: 'Category not found' });
        if (dto.name !== undefined) {
            const name = dto.name.trim();
            if (!name) {
                throw (0, validation_error_1.validationException)({ name: { code: 'NAME_REQUIRED', message: 'Name is required' } });
            }
            const existing = await this.categories.findByName(name);
            if (existing && existing.id !== id) {
                throw (0, validation_error_1.validationException)({ name: { code: 'NAME_EXISTS', message: 'Category name already exists' } });
            }
            category.name = name;
        }
        const updated = await this.categories.update(category);
        return this.toResponse(updated);
    }
    async remove(id) {
        const removed = await this.categories.remove(id);
        if (!removed)
            throw new common_1.NotFoundException({ message: 'Category not found' });
        return this.toResponse(removed);
    }
    toResponse(category) {
        return { id: category.id, name: category.name };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(category_repository_1.CATEGORY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map