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
exports.FileManagerService = void 0;
const common_1 = require("@nestjs/common");
const file_directory_entity_1 = require("../../domain/entities/file-directory.entity");
const file_grant_entity_1 = require("../../domain/entities/file-grant.entity");
const file_entity_1 = require("../../domain/entities/file.entity");
const file_directory_repository_1 = require("../../domain/repositories/file-directory.repository");
const file_grant_repository_1 = require("../../domain/repositories/file-grant.repository");
const file_repository_1 = require("../../domain/repositories/file.repository");
const storage_service_1 = require("../../shared/services/storage.service");
const users_service_1 = require("./users.service");
let FileManagerService = class FileManagerService {
    constructor(directories, files, grants, storage, usersService) {
        this.directories = directories;
        this.files = files;
        this.grants = grants;
        this.storage = storage;
        this.usersService = usersService;
    }
    async getUserRoleIds(userId) {
        const user = await this.usersService.findDomainById(userId);
        if (!user)
            throw new common_1.NotFoundException({ message: "User not found" });
        return user.roles;
    }
    buildFileResponse(file, grants = []) {
        return {
            id: file.id,
            directoryId: file.directoryId,
            ownerId: file.ownerId,
            originalName: file.originalName,
            displayName: file.displayName,
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
            visibility: file.visibility,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            url: this.storage.getPublicUrl(file.storageKey),
            grants: grants.map((grant) => ({
                roleId: grant.roleId,
                access: grant.access,
            })),
        };
    }
    buildDirectoryResponse(directory, grants = []) {
        return {
            id: directory.id,
            parentId: directory.parentId,
            ownerId: directory.ownerId,
            name: directory.name,
            createdAt: directory.createdAt,
            updatedAt: directory.updatedAt,
            grants: grants.map((grant) => ({
                roleId: grant.roleId,
                access: grant.access,
            })),
        };
    }
    async computeDirectoryAccess(userId, roleIds, directory) {
        if (directory.ownerId === userId) {
            return { directory, access: "owner" };
        }
        if (!roleIds.length)
            return null;
        const grants = await this.grants.findForRole("directory", directory.id, roleIds);
        if (!grants.length)
            return null;
        const hasWrite = grants.some((grant) => grant.access === "write");
        return { directory, access: hasWrite ? "write" : "read" };
    }
    async computeFileAccess(userId, roleIds, file, parentAccess) {
        if (file.ownerId === userId)
            return { file, access: "owner" };
        if (parentAccess &&
            (parentAccess.access === "write" || parentAccess.access === "read")) {
            return { file, access: parentAccess.access };
        }
        if (!roleIds.length)
            return null;
        const grants = await this.grants.findForRole("file", file.id, roleIds);
        if (!grants.length)
            return null;
        const hasWrite = grants.some((grant) => grant.access === "write");
        return { file, access: hasWrite ? "write" : "read" };
    }
    async buildBreadcrumb(directoryId) {
        if (!directoryId)
            return [];
        const breadcrumb = [];
        let currentId = directoryId;
        while (currentId) {
            const dir = await this.directories.findById(currentId);
            if (!dir)
                break;
            breadcrumb.unshift({ id: dir.id, name: dir.name });
            currentId = dir.parentId;
        }
        return breadcrumb;
    }
    async listDirectory(userId, directoryId) {
        const roleIds = await this.getUserRoleIds(userId);
        const ownedDirs = await this.directories.findChildren(userId, directoryId);
        const candidateDirs = await this.directories.findByParent(directoryId);
        const accessibleDirs = [];
        const seen = new Set();
        const addDir = (access) => {
            if (seen.has(access.directory.id))
                return;
            seen.add(access.directory.id);
            accessibleDirs.push(access);
        };
        ownedDirs.forEach((dir) => addDir({ directory: dir, access: "owner" }));
        for (const dir of candidateDirs) {
            if (dir.ownerId === userId)
                continue;
            const access = await this.computeDirectoryAccess(userId, roleIds, dir);
            if (access)
                addDir(access);
        }
        const directories = [];
        for (const entry of accessibleDirs) {
            const grants = entry.access === "owner"
                ? await this.grants.findByEntity("directory", entry.directory.id)
                : [];
            directories.push(this.buildDirectoryResponse(entry.directory, grants));
        }
        const filesOwned = await this.files.findByDirectory(userId, directoryId);
        const filesAny = await this.files.findByDirectoryAny(directoryId);
        const accessibleFiles = [];
        const fileSeen = new Set();
        filesOwned.forEach((file) => {
            accessibleFiles.push({ file, access: "owner" });
            fileSeen.add(file.id);
        });
        for (const file of filesAny) {
            if (fileSeen.has(file.id))
                continue;
            const parentDir = file.directoryId
                ? accessibleDirs.find((entry) => entry.directory.id === file.directoryId)
                : null;
            const access = await this.computeFileAccess(userId, roleIds, file, parentDir ?? null);
            if (access) {
                accessibleFiles.push(access);
                fileSeen.add(file.id);
            }
        }
        const files = [];
        for (const entry of accessibleFiles) {
            const grants = entry.access === "owner"
                ? await this.grants.findByEntity("file", entry.file.id)
                : [];
            files.push(this.buildFileResponse(entry.file, grants));
        }
        const breadcrumb = await this.buildBreadcrumb(directoryId);
        return { directories, files, breadcrumb };
    }
    async requireDirectory(ownerId, directoryId) {
        const dir = await this.directories.findById(directoryId);
        if (!dir)
            throw new common_1.NotFoundException({ message: "Directory not found" });
        if (dir.ownerId !== ownerId)
            throw new common_1.ForbiddenException({ message: "Not allowed" });
        return dir;
    }
    async createDirectory(ownerId, dto) {
        if (dto.parentId) {
            await this.requireDirectory(ownerId, dto.parentId);
        }
        const now = new Date();
        const dir = new file_directory_entity_1.FileDirectory(0, ownerId, dto.name.trim(), dto.parentId ?? null, now, now);
        const created = await this.directories.create(dir);
        return this.buildDirectoryResponse(created, []);
    }
    async updateDirectory(ownerId, id, dto) {
        const dir = await this.requireDirectory(ownerId, id);
        if (dto.parentId !== undefined) {
            if (dto.parentId === null) {
                dir.parentId = null;
            }
            else {
                const parent = await this.requireDirectory(ownerId, dto.parentId);
                if (parent.id === dir.id) {
                    throw new common_1.BadRequestException({
                        message: "Cannot set directory as its own parent",
                    });
                }
                dir.parentId = parent.id;
            }
        }
        if (dto.name !== undefined) {
            dir.name = dto.name.trim();
        }
        dir.updatedAt = new Date();
        const saved = await this.directories.update(dir);
        const grants = await this.grants.findByEntity("directory", saved.id);
        return this.buildDirectoryResponse(saved, grants);
    }
    async deleteDirectory(ownerId, id) {
        await this.requireDirectory(ownerId, id);
        await this.directories.remove(id);
        await this.grants.removeForEntity("directory", id);
    }
    async uploadFile(ownerId, fileBuffer, originalName, options) {
        const directoryId = options.directoryId ?? null;
        if (directoryId) {
            await this.requireDirectory(ownerId, directoryId);
        }
        const now = new Date();
        const displayName = (options.displayName || originalName || "file").trim();
        const { storageKey, url } = await this.storage.save(fileBuffer, originalName);
        const fileEntity = new file_entity_1.FileEntity(0, ownerId, directoryId, originalName, displayName, storageKey, options.mimeType ?? null, options.sizeBytes ?? fileBuffer.length, options.visibility ?? "private", now, now, url);
        const created = await this.files.create(fileEntity);
        return this.buildFileResponse(created, []);
    }
    async updateFile(ownerId, id, dto) {
        const file = await this.files.findById(id);
        if (!file)
            throw new common_1.NotFoundException({ message: "File not found" });
        if (file.ownerId !== ownerId)
            throw new common_1.ForbiddenException({ message: "Not allowed" });
        if (dto.directoryId !== undefined) {
            if (dto.directoryId === null) {
                file.directoryId = null;
            }
            else {
                await this.requireDirectory(ownerId, dto.directoryId);
                file.directoryId = dto.directoryId;
            }
        }
        if (dto.displayName !== undefined) {
            file.displayName = dto.displayName.trim();
        }
        if (dto.visibility !== undefined) {
            file.visibility = dto.visibility;
        }
        file.updatedAt = new Date();
        const saved = await this.files.update(file);
        const grants = await this.grants.findByEntity("file", saved.id);
        return this.buildFileResponse(saved, grants);
    }
    async deleteFile(ownerId, id) {
        const file = await this.files.findById(id);
        if (!file)
            throw new common_1.NotFoundException({ message: "File not found" });
        if (file.ownerId !== ownerId)
            throw new common_1.ForbiddenException({ message: "Not allowed" });
        await this.files.remove(id);
        await this.grants.removeForEntity("file", id);
        await this.storage.delete(file.storageKey);
    }
    async updateDirectoryGrants(ownerId, id, dto) {
        const directory = await this.requireDirectory(ownerId, id);
        await this.grants.removeForEntity("directory", directory.id);
        for (const grant of dto.grants) {
            await this.grants.create(new file_grant_entity_1.FileGrant(0, "directory", directory.id, grant.roleId, grant.access));
        }
    }
    async updateFileGrants(ownerId, id, dto) {
        const file = await this.files.findById(id);
        if (!file)
            throw new common_1.NotFoundException({ message: "File not found" });
        if (file.ownerId !== ownerId)
            throw new common_1.ForbiddenException({ message: "Not allowed" });
        await this.grants.removeForEntity("file", file.id);
        for (const grant of dto.grants) {
            await this.grants.create(new file_grant_entity_1.FileGrant(0, "file", file.id, grant.roleId, grant.access));
        }
    }
};
exports.FileManagerService = FileManagerService;
exports.FileManagerService = FileManagerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(file_directory_repository_1.FILE_DIRECTORY_REPOSITORY)),
    __param(1, (0, common_1.Inject)(file_repository_1.FILE_REPOSITORY)),
    __param(2, (0, common_1.Inject)(file_grant_repository_1.FILE_GRANT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, storage_service_1.StorageService,
        users_service_1.UsersService])
], FileManagerService);
//# sourceMappingURL=file-manager.service.js.map