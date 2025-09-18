"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("./constants");
let TokenService = class TokenService {
    constructor() {
        this.secret = process.env.JWT_SECRET || constants_1.DEFAULT_JWT_SECRET;
        this.expiresIn = '1h';
    }
    sign(userId) {
        return jsonwebtoken_1.default.sign({ sub: userId }, this.secret, { expiresIn: this.expiresIn });
    }
    verify(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, this.secret);
            if (typeof payload === 'string')
                throw new Error('Invalid payload');
            return { sub: Number(payload.sub), iat: payload.iat, exp: payload.exp };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)()
], TokenService);
//# sourceMappingURL=token.service.js.map