"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
let StorageService = class StorageService {
    constructor() {
        this.uploadRoot = process.env.FILE_STORAGE_ROOT
            ? path.resolve(process.env.FILE_STORAGE_ROOT)
            : path.resolve(process.cwd(), 'uploads');
    }
    async ensureDir(dir) {
        await fs_1.promises.mkdir(dir, { recursive: true });
    }
    buildPublicUrl(storageKey) {
        const publicBase = process.env.FILE_PUBLIC_BASE_URL;
        if (publicBase && publicBase.trim().length) {
            return `${publicBase.replace(/\/$/, '')}/${storageKey}`;
        }
        return `/uploads/${storageKey}`;
    }
    async save(buffer, originalName) {
        const ext = path.extname(originalName || '').slice(0, 16);
        const key = `${(0, crypto_1.randomUUID)()}${ext}`;
        const targetDir = this.uploadRoot;
        const targetPath = path.join(targetDir, key);
        try {
            await this.ensureDir(targetDir);
            await fs_1.promises.writeFile(targetPath, buffer);
        }
        catch (err) {
            throw new common_1.InternalServerErrorException({ message: 'Failed to store file' });
        }
        return { storageKey: key, url: this.buildPublicUrl(key) };
    }
    async delete(storageKey) {
        if (!storageKey)
            return;
        const targetPath = path.join(this.uploadRoot, storageKey);
        try {
            await fs_1.promises.unlink(targetPath);
        }
        catch (err) {
            if (err?.code !== 'ENOENT') {
                throw new common_1.InternalServerErrorException({ message: 'Failed to delete file' });
            }
        }
    }
    getLocalServePath(storageKey) {
        return path.join(this.uploadRoot, storageKey);
    }
    getPublicUrl(storageKey) {
        return this.buildPublicUrl(storageKey);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)()
], StorageService);
//# sourceMappingURL=storage.service.js.map