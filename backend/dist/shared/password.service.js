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
exports.PasswordService = void 0;
const common_1 = require("@nestjs/common");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
let PasswordService = class PasswordService {
    constructor() {
        this.saltRounds = 10;
    }
    async hash(plain) {
        return new Promise((resolve, reject) => {
            bcryptjs_1.default.hash(plain, this.saltRounds, (err, hash) => {
                if (err)
                    return reject(err);
                resolve(hash);
            });
        });
    }
    async compare(plain, hash) {
        return new Promise((resolve, reject) => {
            bcryptjs_1.default.compare(plain, hash, (err, same) => {
                if (err)
                    return reject(err);
                resolve(same);
            });
        });
    }
    hashSync(plain) {
        return bcryptjs_1.default.hashSync(plain, this.saltRounds);
    }
};
exports.PasswordService = PasswordService;
exports.PasswordService = PasswordService = __decorate([
    (0, common_1.Injectable)()
], PasswordService);
//# sourceMappingURL=password.service.js.map