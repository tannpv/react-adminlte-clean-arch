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
exports.AuthorizationService = void 0;
const common_1 = require("@nestjs/common");
const role_repository_1 = require("../../domain/repositories/role.repository");
const user_repository_1 = require("../../domain/repositories/user.repository");
let AuthorizationService = class AuthorizationService {
    constructor(users, roles) {
        this.users = users;
        this.roles = roles;
        this.permissionCache = new Map();
    }
    async hasPermission(userId, permission) {
        const permissions = await this.getPermissions(userId);
        return permissions.has(permission);
    }
    async hasAnyPermission(userId, perms) {
        if (!perms.length)
            return true;
        const permissions = await this.getPermissions(userId);
        return perms.some((perm) => permissions.has(perm));
    }
    async getPermissions(userId) {
        const cached = this.permissionCache.get(userId);
        if (cached) {
            return new Set(cached);
        }
        const user = await this.users.findById(userId);
        if (!user)
            return new Set();
        const roles = await this.roles.findByIds(user.roles);
        const permissions = new Set();
        roles.forEach((role) => {
            ;
            (role.permissions || []).forEach((perm) => permissions.add(perm));
        });
        this.permissionCache.set(userId, permissions);
        return new Set(permissions);
    }
    evictPermissionsForUser(userId) {
        this.permissionCache.delete(userId);
    }
    evictAllPermissions() {
        this.permissionCache.clear();
    }
};
exports.AuthorizationService = AuthorizationService;
exports.AuthorizationService = AuthorizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(role_repository_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], AuthorizationService);
//# sourceMappingURL=authorization.service.js.map