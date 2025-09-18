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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../../domain/repositories/user.repository");
const role_repository_1 = require("../../domain/repositories/role.repository");
const user_entity_1 = require("../../domain/entities/user.entity");
const password_service_1 = require("../../shared/password.service");
const constants_1 = require("../../shared/constants");
const validation_error_1 = require("../../shared/validation-error");
let UsersService = class UsersService {
    constructor(users, roles, passwordService) {
        this.users = users;
        this.roles = roles;
        this.passwordService = passwordService;
    }
    async list() {
        const users = await this.users.findAll();
        return users.map((user) => user.toPublic());
    }
    async findById(id) {
        const user = await this.users.findById(id);
        if (!user)
            throw new common_1.NotFoundException({ message: 'Not found' });
        return user.toPublic();
    }
    async findDomainById(id) {
        return this.users.findById(id);
    }
    async findByEmail(email) {
        return this.users.findByEmail(email);
    }
    async create(dto) {
        const trimmedName = dto.name.trim();
        const trimmedEmail = dto.email.trim();
        const emailLower = trimmedEmail.toLowerCase();
        if (!trimmedName || trimmedName.length < 2) {
            throw (0, validation_error_1.validationException)({
                name: { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' },
            });
        }
        if (!trimmedEmail) {
            throw (0, validation_error_1.validationException)({
                email: { code: 'EMAIL_REQUIRED', message: 'Email is required' },
            });
        }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(trimmedEmail)) {
            throw (0, validation_error_1.validationException)({
                email: { code: 'EMAIL_INVALID', message: 'Email is invalid' },
            });
        }
        const existingByEmail = await this.users.findByEmail(emailLower);
        if (existingByEmail) {
            throw (0, validation_error_1.validationException)({
                email: { code: 'EMAIL_EXISTS', message: 'Email is already in use' },
            });
        }
        const roleIds = await this.validateRoles(dto.roles);
        const id = await this.users.nextId();
        const passwordHash = this.passwordService.hashSync(constants_1.DEFAULT_USER_PASSWORD);
        const user = new user_entity_1.User(id, trimmedName, trimmedEmail, roleIds, passwordHash);
        const created = await this.users.create(user);
        return created.toPublic();
    }
    async update(id, dto) {
        const existing = await this.users.findById(id);
        if (!existing)
            throw new common_1.NotFoundException({ message: 'Not found' });
        const updates = {};
        if (dto.name !== undefined) {
            const trimmed = dto.name.trim();
            if (!trimmed || trimmed.length < 2) {
                throw (0, validation_error_1.validationException)({
                    name: { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' },
                });
            }
            updates.name = trimmed;
        }
        if (dto.email !== undefined) {
            const trimmedEmail = dto.email.trim();
            if (!trimmedEmail) {
                throw (0, validation_error_1.validationException)({
                    email: { code: 'EMAIL_REQUIRED', message: 'Email is required' },
                });
            }
            const emailLower = trimmedEmail.toLowerCase();
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(trimmedEmail)) {
                throw (0, validation_error_1.validationException)({
                    email: { code: 'EMAIL_INVALID', message: 'Email is invalid' },
                });
            }
            const conflict = await this.users.findByEmail(emailLower);
            if (conflict && conflict.id !== id) {
                throw (0, validation_error_1.validationException)({
                    email: { code: 'EMAIL_EXISTS', message: 'Email is already in use' },
                });
            }
            updates.email = trimmedEmail;
        }
        if (dto.roles !== undefined) {
            const roleIds = await this.validateRoles(dto.roles);
            updates.roles = roleIds;
        }
        const updated = existing.clone();
        updated.name = updates.name ?? updated.name;
        updated.email = updates.email ?? updated.email;
        updated.roles = updates.roles ?? updated.roles;
        const saved = await this.users.update(updated);
        return saved.toPublic();
    }
    async remove(id) {
        const removed = await this.users.remove(id);
        if (!removed)
            throw new common_1.NotFoundException({ message: 'Not found' });
        return removed.toPublic();
    }
    async validateRoles(roles) {
        if (roles === undefined)
            return [];
        if (!Array.isArray(roles)) {
            throw (0, validation_error_1.validationException)({
                roles: { code: 'ROLES_INVALID', message: 'Invalid roles selected' },
            });
        }
        const cleaned = roles.filter((roleId) => Number.isInteger(roleId));
        if (!cleaned.length)
            return [];
        const found = await this.roles.findByIds(cleaned);
        const foundIds = new Set(found.map((role) => role.id));
        const missing = cleaned.filter((roleId) => !foundIds.has(roleId));
        if (missing.length) {
            throw (0, validation_error_1.validationException)({
                roles: { code: 'ROLES_INVALID', message: 'Invalid roles selected' },
            });
        }
        return cleaned;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(role_repository_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, password_service_1.PasswordService])
], UsersService);
//# sourceMappingURL=users.service.js.map