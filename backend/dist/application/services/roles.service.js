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
const domain_event_bus_1 = require("../../shared/events/domain-event.bus");
const role_created_event_1 = require("../../domain/events/role-created.event");
const role_updated_event_1 = require("../../domain/events/role-updated.event");
const role_removed_event_1 = require("../../domain/events/role-removed.event");
const role_mapper_1 = require("../mappers/role.mapper");
let RolesService = class RolesService {
    constructor(roles, events) {
        this.roles = roles;
        this.events = events;
    }
    async list() {
        const roles = await this.roles.findAll();
        return roles.map((role) => (0, role_mapper_1.toRoleResponse)(role));
    }
    async findMany(ids) {
        return this.roles.findByIds(ids);
    }
    async findByNameDomain(name) {
        return this.roles.findByName(name);
    }
    async findByIdDomain(id) {
        return this.roles.findById(id);
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
        const created = await this.roles.create(role);
        this.events.publish(new role_created_event_1.RoleCreatedEvent(created));
        return (0, role_mapper_1.toRoleResponse)(created);
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
        const updated = await this.roles.update(existing);
        this.events.publish(new role_updated_event_1.RoleUpdatedEvent(updated));
        return (0, role_mapper_1.toRoleResponse)(updated);
    }
    async remove(id) {
        const removed = await this.roles.remove(id);
        if (!removed)
            throw new common_1.NotFoundException({ message: 'Not found' });
        this.events.publish(new role_removed_event_1.RoleRemovedEvent(removed));
        return (0, role_mapper_1.toRoleResponse)(removed);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(role_repository_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, domain_event_bus_1.DomainEventBus])
], RolesService);
//# sourceMappingURL=roles.service.js.map