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
const user_profile_entity_1 = require("../../domain/entities/user-profile.entity");
const password_service_1 = require("../../shared/password.service");
const constants_1 = require("../../shared/constants");
const validation_error_1 = require("../../shared/validation-error");
const user_validation_service_1 = require("../validation/user-validation.service");
const user_update_validation_service_1 = require("../validation/user-update-validation.service");
let UsersService = class UsersService {
    constructor(users, roles, passwordService, userValidationService, userUpdateValidationService) {
        this.users = users;
        this.roles = roles;
        this.passwordService = passwordService;
        this.userValidationService = userValidationService;
        this.userUpdateValidationService = userUpdateValidationService;
    }
    async list({ search } = {}) {
        const users = await this.users.findAll({ search });
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
        const validation = await this.userValidationService.validate(dto);
        if (!validation.isValid) {
            throw (0, validation_error_1.validationException)(validation.errors);
        }
        const trimmedEmail = dto.email.trim().toLowerCase();
        const roleIds = dto.roles || [];
        const id = await this.users.nextId();
        const passwordHash = this.passwordService.hashSync(constants_1.DEFAULT_USER_PASSWORD);
        let dateOfBirth = null;
        if (dto.dateOfBirth) {
            dateOfBirth = new Date(dto.dateOfBirth);
        }
        const user = new user_entity_1.User(id, trimmedEmail, roleIds, passwordHash);
        user.profile = new user_profile_entity_1.UserProfile({
            userId: id,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            dateOfBirth,
            pictureUrl: dto.pictureUrl?.trim() || null,
        });
        const created = await this.users.create(user);
        return created.toPublic();
    }
    async update(id, dto) {
        const existing = await this.users.findById(id);
        if (!existing)
            throw new common_1.NotFoundException({ message: 'Not found' });
        const validation = await this.userUpdateValidationService.validate(dto, id);
        if (!validation.isValid) {
            throw (0, validation_error_1.validationException)(validation.errors);
        }
        const updated = existing.clone();
        const profile = updated.profile ?? new user_profile_entity_1.UserProfile({
            userId: updated.id,
            firstName: '',
            lastName: null,
            dateOfBirth: null,
            pictureUrl: null,
        });
        if (dto.email !== undefined) {
            updated.email = dto.email.trim();
        }
        if (dto.roles !== undefined) {
            updated.roles = dto.roles;
        }
        if (dto.password !== undefined) {
            updated.passwordHash = this.passwordService.hashSync(dto.password);
        }
        if (dto.firstName !== undefined) {
            profile.firstName = dto.firstName.trim();
        }
        if (dto.lastName !== undefined) {
            profile.lastName = dto.lastName.trim();
        }
        if (dto.dateOfBirth !== undefined) {
            profile.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
        }
        if (dto.pictureUrl !== undefined) {
            const trimmed = dto.pictureUrl?.trim() || '';
            profile.pictureUrl = trimmed.length ? trimmed : null;
        }
        updated.profile = profile;
        const saved = await this.users.update(updated);
        return saved.toPublic();
    }
    async remove(id) {
        const removed = await this.users.remove(id);
        if (!removed)
            throw new common_1.NotFoundException({ message: 'Not found' });
        return removed.toPublic();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(role_repository_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, password_service_1.PasswordService,
        user_validation_service_1.UserValidationService,
        user_update_validation_service_1.UserUpdateValidationService])
], UsersService);
//# sourceMappingURL=users.service.js.map