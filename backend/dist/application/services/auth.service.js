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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../../domain/repositories/user.repository");
const role_repository_1 = require("../../domain/repositories/role.repository");
const password_service_1 = require("../../shared/password.service");
const token_service_1 = require("../../shared/token.service");
const user_entity_1 = require("../../domain/entities/user.entity");
let AuthService = class AuthService {
    constructor(users, roles, passwordService, tokenService) {
        this.users = users;
        this.roles = roles;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
    }
    async register(dto) {
        const trimmedName = dto.name.trim();
        const trimmedEmail = dto.email.trim();
        const emailLower = trimmedEmail.toLowerCase();
        const existing = await this.users.findByEmail(emailLower);
        if (existing) {
            throw new common_1.ConflictException({ message: 'Email already in use' });
        }
        const passwordHash = await this.passwordService.hash(dto.password);
        const id = await this.users.nextId();
        const defaultRole = await this.findDefaultUserRoleId();
        const user = new user_entity_1.User(id, trimmedName, trimmedEmail, defaultRole ? [defaultRole] : [], passwordHash);
        const created = await this.users.create(user);
        const token = this.tokenService.sign(created.id);
        return {
            token,
            user: created.toPublic(),
        };
    }
    async login(dto) {
        const emailLower = dto.email.trim().toLowerCase();
        const user = await this.users.findByEmail(emailLower);
        if (!user) {
            throw new common_1.UnauthorizedException({ message: 'Invalid credentials' });
        }
        const passwordOk = await this.passwordService.compare(dto.password, user.passwordHash);
        if (!passwordOk) {
            throw new common_1.UnauthorizedException({ message: 'Invalid credentials' });
        }
        const token = this.tokenService.sign(user.id);
        return {
            token,
            user: user.toPublic(),
        };
    }
    async findDefaultUserRoleId() {
        const byName = await this.roles.findByName('User');
        if (byName)
            return byName.id;
        const fallback = await this.roles.findById(2);
        return fallback ? fallback.id : null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(role_repository_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, password_service_1.PasswordService,
        token_service_1.TokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map