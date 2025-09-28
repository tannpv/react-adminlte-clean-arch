import { FileVisibility } from "../../domain/entities/file.entity";
import { FileDirectoryRepository } from "../../domain/repositories/file-directory.repository";
import { FileGrantRepository } from "../../domain/repositories/file-grant.repository";
import { FileRepository } from "../../domain/repositories/file.repository";
import { StorageService } from "../../shared/services/storage.service";
import { CreateDirectoryDto } from "../dto/create-directory.dto";
import { UpdateDirectoryDto } from "../dto/update-directory.dto";
import { UpdateFileGrantsDto } from "../dto/update-file-grants.dto";
import { UpdateFileDto } from "../dto/update-file.dto";
import { UsersService } from "./users.service";
export declare class FileManagerService {
    private readonly directories;
    private readonly files;
    private readonly grants;
    private readonly storage;
    private readonly usersService;
    constructor(directories: FileDirectoryRepository, files: FileRepository, grants: FileGrantRepository, storage: StorageService, usersService: UsersService);
    private getUserRoleIds;
    private buildFileResponse;
    private buildDirectoryResponse;
    private computeDirectoryAccess;
    private computeFileAccess;
    private buildBreadcrumb;
    listDirectory(userId: number, directoryId: number | null): Promise<{
        directories: any[];
        files: any[];
        breadcrumb: any[];
    }>;
    private requireDirectory;
    createDirectory(ownerId: number, dto: CreateDirectoryDto): Promise<any>;
    updateDirectory(ownerId: number, id: number, dto: UpdateDirectoryDto): Promise<any>;
    deleteDirectory(ownerId: number, id: number): Promise<void>;
    uploadFile(ownerId: number, fileBuffer: Buffer, originalName: string, options: {
        directoryId?: number | null;
        displayName?: string;
        visibility?: FileVisibility;
        mimeType?: string | null;
        sizeBytes?: number | null;
    }): Promise<any>;
    updateFile(ownerId: number, id: number, dto: UpdateFileDto): Promise<any>;
    deleteFile(ownerId: number, id: number): Promise<void>;
    updateDirectoryGrants(ownerId: number, id: number, dto: UpdateFileGrantsDto): Promise<void>;
    updateFileGrants(ownerId: number, id: number, dto: UpdateFileGrantsDto): Promise<void>;
}
