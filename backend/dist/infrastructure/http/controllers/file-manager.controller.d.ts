import { AuthenticatedRequest } from '../interfaces/authenticated-request';
import { FileManagerService } from '../../../application/services/file-manager.service';
import { CreateDirectoryDto } from '../../../application/dto/create-directory.dto';
import { UpdateDirectoryDto } from '../../../application/dto/update-directory.dto';
import { UpdateFileDto } from '../../../application/dto/update-file.dto';
import { UpdateFileGrantsDto } from '../../../application/dto/update-file-grants.dto';
export declare class FileManagerController {
    private readonly fileManager;
    constructor(fileManager: FileManagerService);
    list(req: AuthenticatedRequest, directoryId?: string): Promise<{
        directories: any[];
        files: any[];
        breadcrumb: any[];
    }>;
    createDirectory(req: AuthenticatedRequest, dto: CreateDirectoryDto): Promise<any>;
    updateDirectory(req: AuthenticatedRequest, id: number, dto: UpdateDirectoryDto): Promise<any>;
    deleteDirectory(req: AuthenticatedRequest, id: number): Promise<{
        success: boolean;
    }>;
    setDirectoryGrants(req: AuthenticatedRequest, id: number, dto: UpdateFileGrantsDto): Promise<{
        success: boolean;
    }>;
    uploadFile(req: AuthenticatedRequest, file: Express.Multer.File, directoryId?: string, displayName?: string, visibility?: string): Promise<any>;
    updateFile(req: AuthenticatedRequest, id: number, dto: UpdateFileDto): Promise<any>;
    deleteFile(req: AuthenticatedRequest, id: number): Promise<{
        success: boolean;
    }>;
    setFileGrants(req: AuthenticatedRequest, id: number, dto: UpdateFileGrantsDto): Promise<{
        success: boolean;
    }>;
}
