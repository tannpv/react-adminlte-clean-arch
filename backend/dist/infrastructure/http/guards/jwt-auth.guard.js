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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const token_service_1 = require("../../../shared/token.service");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(tokenService) {
        this.tokenService = tokenService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers?.authorization;
        const bearer = Array.isArray(authHeader) ? authHeader[0] : authHeader || '';
        const [, token] = bearer.split(' ');
        if (!token) {
            throw new common_1.UnauthorizedException({ message: 'Unauthorized' });
        }
        const payload = this.tokenService.verify(token);
        const userId = Number(payload.sub);
        if (!userId) {
            throw new common_1.UnauthorizedException({ message: 'Invalid token' });
        }
        request.userId = userId;
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_service_1.TokenService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map