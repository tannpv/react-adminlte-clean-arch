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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManagerController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer = __importStar(require("multer"));
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const file_manager_service_1 = require("../../../application/services/file-manager.service");
const create_directory_dto_1 = require("../../../application/dto/create-directory.dto");
const update_directory_dto_1 = require("../../../application/dto/update-directory.dto");
const update_file_dto_1 = require("../../../application/dto/update-file.dto");
const update_file_grants_dto_1 = require("../../../application/dto/update-file-grants.dto");
const permissions_guard_1 = require("../guards/permissions.guard");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
let FileManagerController = class FileManagerController {
    constructor(fileManager) {
        this.fileManager = fileManager;
    }
    async list(req, directoryId) {
        const userId = req.userId;
        const dirId = directoryId === undefined ? null : directoryId === '' ? null : Number(directoryId);
        if (dirId !== null && Number.isNaN(dirId)) {
            throw new common_1.BadRequestException({ message: 'Invalid directory id' });
        }
        return this.fileManager.listDirectory(userId, dirId);
    }
    async createDirectory(req, dto) {
        const userId = req.userId;
        return this.fileManager.createDirectory(userId, dto);
    }
    async updateDirectory(req, id, dto) {
        const userId = req.userId;
        return this.fileManager.updateDirectory(userId, id, dto);
    }
    async deleteDirectory(req, id) {
        const userId = req.userId;
        await this.fileManager.deleteDirectory(userId, id);
        return { success: true };
    }
    async setDirectoryGrants(req, id, dto) {
        const userId = req.userId;
        await this.fileManager.updateDirectoryGrants(userId, id, dto);
        return { success: true };
    }
    async uploadFile(req, file, directoryId, displayName, visibility) {
        if (!file) {
            throw new common_1.BadRequestException({ message: 'File is required' });
        }
        const userId = req.userId;
        const dirId = directoryId === undefined || directoryId === '' ? null : Number(directoryId);
        const visibilityValue = visibility === 'public' ? 'public' : 'private';
        return this.fileManager.uploadFile(userId, file.buffer, file.originalname, {
            directoryId: dirId,
            displayName,
            visibility: visibilityValue,
            mimeType: file.mimetype,
            sizeBytes: file.size,
        });
    }
    async updateFile(req, id, dto) {
        const userId = req.userId;
        return this.fileManager.updateFile(userId, id, dto);
    }
    async deleteFile(req, id) {
        const userId = req.userId;
        await this.fileManager.deleteFile(userId, id);
        return { success: true };
    }
    async setFileGrants(req, id, dto) {
        const userId = req.userId;
        await this.fileManager.updateFileGrants(userId, id, dto);
        return { success: true };
    }
};
exports.FileManagerController = FileManagerController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequireAnyPermission)('storage:read', 'storage:create', 'storage:update', 'storage:delete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('directoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FileManagerController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('directories'),
    (0, permissions_decorator_1.RequirePermissions)('storage:create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_directory_dto_1.CreateDirectoryDto]),
    __metadata("design:returntype", Promise)
], FileManagerController.prototype, "createDirectory", null);
__decorate([
    (0, common_1.Patch)('directories/:id'),
    (0, permissions_decorator_1.RequirePermissions)('storage:update'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_directory_dto_1.UpdateDirectoryDto]),
    __metadata("design:returntype", Promise)
], FileManagerController.prototype, "updateDirectory", null);
__decorate([
    (0, common_1.Delete)('directories/:id'),
    (0, permissions_decorator_1.RequirePermissions)('storage:delete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], FileManagerController.prototype, "deleteDirectory", null);
__decorate([
    (0, common_1.Put)('directories/:id/grants'),
    (0, permissions_decorator_1.RequirePermissions)('storage:update'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_file_grants_dto_1.UpdateFileGrantsDto]),
    __metadata("design:returntype", Promise)
], FileManagerController.prototype, "setDirectoryGrants", null);
__decorate([
    (0, common_1.Post)('files'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multer.memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 },
    })),
    (0, permissions_decorator_1.RequirePermissions)('storage:create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('directoryId')),
    __param(3, (0, common_1.Body)('displayName')),
    __param(4, (0, common_1.Body)('visibility')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], FileManagerController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Patch)('files/:id'),
    (0, permissions_decorator_1.RequirePermissions)('storage:update'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_file_dto_1.UpdateFileDto]),
    __metadata("design:returntype", Promise)
], FileManagerController.prototype, "updateFile", null);
__decorate([
    (0, common_1.Delete)('files/:id'),
    (0, permissions_decorator_1.RequirePermissions)('storage:delete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], FileManagerController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Put)('files/:id/grants'),
    (0, permissions_decorator_1.RequirePermissions)('storage:update'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_file_grants_dto_1.UpdateFileGrantsDto]),
    __metadata("design:returntype", Promise)
], FileManagerController.prototype, "setFileGrants", null);
exports.FileManagerController = FileManagerController = __decorate([
    (0, common_1.Controller)('storage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [file_manager_service_1.FileManagerService])
], FileManagerController);
//# sourceMappingURL=file-manager.controller.js.map