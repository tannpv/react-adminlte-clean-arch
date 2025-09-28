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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const role_repository_1 = require("../../domain/repositories/role.repository");
const validation_error_1 = require("../../shared/validation-error");
const role_entity_1 = require("../../domain/entities/role.entity");
let RolesService = class RolesService {
    constructor(roles) {
        this.roles = roles;
    }
    async list() {
        return this.roles.findAll();
    }
    async findMany(ids) {
        return this.roles.findByIds(ids);
    }
    async create(dto) {
        const name = dto.name.trim();
        if (!name || name.length < 2) {
            throw (0, validation_error_1.validationException)({
                name: { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' },
            });
        }
        const existing = await this.roles.findByName(name);
        if (existing) {
            throw (0, validation_error_1.validationException)({
                name: { code: 'NAME_EXISTS', message: 'Role name already exists' },
            });
        }
        const id = await this.roles.nextId();
        const role = new role_entity_1.Role(id, name, Array.isArray(dto.permissions) ? dto.permissions : []);
        return this.roles.create(role);
    }
    async update(id, dto) {
        const existing = await this.roles.findById(id);
        if (!existing)
            throw new common_1.NotFoundException({ message: 'Not found' });
        if (dto.name !== undefined) {
            const name = dto.name.trim();
            if (!name || name.length < 2) {
                throw (0, validation_error_1.validationException)({
                    name: { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' },
                });
            }
            const conflict = await this.roles.findByName(name);
            if (conflict && conflict.id !== id) {
                throw (0, validation_error_1.validationException)({
                    name: { code: 'NAME_EXISTS', message: 'Role name already exists' },
                });
            }
            existing.name = name;
        }
        if (dto.permissions !== undefined) {
            existing.permissions = Array.isArray(dto.permissions) ? [...dto.permissions] : [];
        }
        return this.roles.update(existing);
    }
    async remove(id) {
        const removed = await this.roles.remove(id);
        if (!removed)
            throw new common_1.NotFoundException({ message: 'Not found' });
        return removed;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(role_repository_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], RolesService);
//# sourceMappingURL=roles.service.js.map