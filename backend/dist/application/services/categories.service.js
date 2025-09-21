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
        const byId = new Map(categories.map((category) => [category.id, category]));
        const responses = categories.map((category) => {
            const parent = category.parentId ? byId.get(category.parentId) ?? null : null;
            return this.toResponse(category, parent);
        });
        const hierarchy = this.buildHierarchyOptions(categories);
        const tree = this.buildCategoryTree(categories);
        return { categories: responses, tree, hierarchy };
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
        const parent = await this.validateParent(dto.parentId ?? null);
        const parentId = parent?.id ?? null;
        const id = await this.categories.nextId();
        const category = new category_entity_1.Category(id, name, parentId);
        const created = await this.categories.create(category);
        return this.toResponse(created, parent);
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
        let parent = null;
        if (dto.parentId !== undefined) {
            parent = await this.validateParent(dto.parentId ?? null, id);
            category.parentId = parent?.id ?? null;
        }
        else {
            parent = category.parentId ? await this.categories.findById(category.parentId) : null;
        }
        const updated = await this.categories.update(category);
        return this.toResponse(updated, parent);
    }
    async remove(id) {
        const removed = await this.categories.remove(id);
        if (!removed)
            throw new common_1.NotFoundException({ message: 'Category not found' });
        const parent = removed.parentId ? await this.categories.findById(removed.parentId) : null;
        return this.toResponse(removed, parent);
    }
    toResponse(category, parent) {
        return {
            id: category.id,
            name: category.name,
            parentId: category.parentId ?? null,
            parentName: parent?.name ?? null,
        };
    }
    async validateParent(parentId, currentId) {
        if (parentId === null || parentId === undefined) {
            return null;
        }
        if (currentId !== undefined && parentId === currentId) {
            throw (0, validation_error_1.validationException)({ parentId: { code: 'INVALID_PARENT', message: 'Category cannot be its own parent' } });
        }
        const parent = await this.categories.findById(parentId);
        if (!parent) {
            throw (0, validation_error_1.validationException)({ parentId: { code: 'PARENT_NOT_FOUND', message: 'Parent category not found' } });
        }
        if (currentId !== undefined) {
            const visited = new Set();
            let cursor = parent;
            while (cursor) {
                if (visited.has(cursor.id))
                    break;
                visited.add(cursor.id);
                if (cursor.parentId === null || cursor.parentId === undefined)
                    break;
                if (cursor.parentId === currentId) {
                    throw (0, validation_error_1.validationException)({ parentId: { code: 'INVALID_PARENT', message: 'Cannot set a descendant as parent' } });
                }
                cursor = await this.categories.findById(cursor.parentId);
            }
        }
        return parent;
    }
    buildHierarchyOptions(categories) {
        if (!categories.length)
            return [];
        const byId = new Map(categories.map((category) => [category.id, category]));
        const childrenMap = new Map();
        categories.forEach((category) => {
            const key = category.parentId ?? null;
            if (!childrenMap.has(key)) {
                childrenMap.set(key, []);
            }
            childrenMap.get(key).push(category);
        });
        childrenMap.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
        const visited = new Set();
        const options = [];
        const traverse = (node, depth, ancestry) => {
            if (ancestry.has(node.id) || visited.has(node.id)) {
                return;
            }
            const nextAncestry = new Set(ancestry);
            nextAncestry.add(node.id);
            visited.add(node.id);
            const prefix = depth ? `${'--'.repeat(depth)} ` : '';
            options.push({
                id: node.id,
                label: `${prefix}${node.name}`,
                disabled: false,
            });
            const children = childrenMap.get(node.id) ?? [];
            children.forEach((child) => traverse(child, depth + 1, nextAncestry));
        };
        const roots = categories
            .filter((category) => category.parentId == null || !byId.has(category.parentId))
            .sort((a, b) => a.name.localeCompare(b.name));
        roots.forEach((root) => traverse(root, 0, new Set()));
        categories.forEach((category) => {
            if (!visited.has(category.id)) {
                traverse(category, 0, new Set());
            }
        });
        return options;
    }
    buildCategoryTree(categories) {
        if (!categories.length)
            return [];
        const byId = new Map(categories.map((category) => [category.id, category]));
        const childrenMap = new Map();
        categories.forEach((category) => {
            const key = category.parentId ?? null;
            if (!childrenMap.has(key)) {
                childrenMap.set(key, []);
            }
            childrenMap.get(key).push(category);
        });
        childrenMap.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
        const visited = new Set();
        const tree = [];
        const buildNode = (category, depth) => {
            const children = childrenMap.get(category.id) ?? [];
            return {
                id: category.id,
                name: category.name,
                parentId: category.parentId,
                depth,
                disabled: false,
                children: children.map(child => buildNode(child, depth + 1))
            };
        };
        const roots = categories
            .filter((category) => category.parentId == null || !byId.has(category.parentId))
            .sort((a, b) => a.name.localeCompare(b.name));
        roots.forEach((root) => {
            if (!visited.has(root.id)) {
                tree.push(buildNode(root, 0));
                visited.add(root.id);
            }
        });
        categories.forEach((category) => {
            if (!visited.has(category.id)) {
                tree.push(buildNode(category, 0));
                visited.add(category.id);
            }
        });
        return tree;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(category_repository_1.CATEGORY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map