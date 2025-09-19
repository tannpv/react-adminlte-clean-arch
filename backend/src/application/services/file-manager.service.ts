import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FileDirectory } from "../../domain/entities/file-directory.entity";
import {
  FileGrant,
  FileGrantAccess,
} from "../../domain/entities/file-grant.entity";
import { FileEntity, FileVisibility } from "../../domain/entities/file.entity";
import {
  FILE_DIRECTORY_REPOSITORY,
  FileDirectoryRepository,
} from "../../domain/repositories/file-directory.repository";
import {
  FILE_GRANT_REPOSITORY,
  FileGrantRepository,
} from "../../domain/repositories/file-grant.repository";
import {
  FILE_REPOSITORY,
  FileRepository,
} from "../../domain/repositories/file.repository";
import { StorageService } from "../../shared/services/storage.service";
import { CreateDirectoryDto } from "../dto/create-directory.dto";
import { UpdateDirectoryDto } from "../dto/update-directory.dto";
import { UpdateFileGrantsDto } from "../dto/update-file-grants.dto";
import { UpdateFileDto } from "../dto/update-file.dto";
import { UsersService } from "./users.service";

interface DirectoryAccess {
  directory: FileDirectory;
  access: FileGrantAccess | "owner";
}

interface FileAccess {
  file: FileEntity;
  access: FileGrantAccess | "owner";
}

@Injectable()
export class FileManagerService {
  constructor(
    @Inject(FILE_DIRECTORY_REPOSITORY)
    private readonly directories: FileDirectoryRepository,
    @Inject(FILE_REPOSITORY) private readonly files: FileRepository,
    @Inject(FILE_GRANT_REPOSITORY) private readonly grants: FileGrantRepository,
    private readonly storage: StorageService,
    private readonly usersService: UsersService
  ) {}

  private async getUserRoleIds(userId: number): Promise<number[]> {
    const user = await this.usersService.findDomainById(userId);
    if (!user) throw new NotFoundException({ message: "User not found" });
    return user.roles;
  }

  private buildFileResponse(file: FileEntity, grants: FileGrant[] = []): any {
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

  private buildDirectoryResponse(
    directory: FileDirectory,
    grants: FileGrant[] = []
  ): any {
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

  private async computeDirectoryAccess(
    userId: number,
    roleIds: number[],
    directory: FileDirectory
  ): Promise<DirectoryAccess | null> {
    if (directory.ownerId === userId) {
      return { directory, access: "owner" };
    }
    if (!roleIds.length) return null;
    const grants = await this.grants.findForRole(
      "directory",
      directory.id,
      roleIds
    );
    if (!grants.length) return null;
    const hasWrite = grants.some((grant) => grant.access === "write");
    return { directory, access: hasWrite ? "write" : "read" };
  }

  private async computeFileAccess(
    userId: number,
    roleIds: number[],
    file: FileEntity,
    parentAccess?: DirectoryAccess | null
  ): Promise<FileAccess | null> {
    if (file.ownerId === userId) return { file, access: "owner" };
    if (
      parentAccess &&
      (parentAccess.access === "write" || parentAccess.access === "read")
    ) {
      return { file, access: parentAccess.access };
    }
    if (!roleIds.length) return null;
    const grants = await this.grants.findForRole("file", file.id, roleIds);
    if (!grants.length) return null;
    const hasWrite = grants.some((grant) => grant.access === "write");
    return { file, access: hasWrite ? "write" : "read" };
  }

  private async buildBreadcrumb(directoryId: number | null): Promise<any[]> {
    if (!directoryId) return [];
    const breadcrumb = [];
    let currentId = directoryId;

    while (currentId) {
      const dir = await this.directories.findById(currentId);
      if (!dir) break;
      breadcrumb.unshift({ id: dir.id, name: dir.name });
      currentId = dir.parentId;
    }

    return breadcrumb;
  }

  async listDirectory(userId: number, directoryId: number | null) {
    const roleIds = await this.getUserRoleIds(userId);
    const ownedDirs = await this.directories.findChildren(userId, directoryId);
    const candidateDirs = await this.directories.findByParent(directoryId);
    const accessibleDirs: DirectoryAccess[] = [];
    const seen = new Set<number>();

    const addDir = (access: DirectoryAccess) => {
      if (seen.has(access.directory.id)) return;
      seen.add(access.directory.id);
      accessibleDirs.push(access);
    };

    ownedDirs.forEach((dir) => addDir({ directory: dir, access: "owner" }));

    for (const dir of candidateDirs) {
      if (dir.ownerId === userId) continue; // already added
      const access = await this.computeDirectoryAccess(userId, roleIds, dir);
      if (access) addDir(access);
    }

    const directories = [];
    for (const entry of accessibleDirs) {
      const grants =
        entry.access === "owner"
          ? await this.grants.findByEntity("directory", entry.directory.id)
          : [];
      directories.push(this.buildDirectoryResponse(entry.directory, grants));
    }

    // Files
    const filesOwned = await this.files.findByDirectory(userId, directoryId);
    const filesAny = await this.files.findByDirectoryAny(directoryId);
    const accessibleFiles: FileAccess[] = [];
    const fileSeen = new Set<number>();

    filesOwned.forEach((file) => {
      accessibleFiles.push({ file, access: "owner" });
      fileSeen.add(file.id);
    });

    for (const file of filesAny) {
      if (fileSeen.has(file.id)) continue;
      const parentDir = file.directoryId
        ? accessibleDirs.find(
            (entry) => entry.directory.id === file.directoryId
          )
        : null;
      const access = await this.computeFileAccess(
        userId,
        roleIds,
        file,
        parentDir ?? null
      );
      if (access) {
        accessibleFiles.push(access);
        fileSeen.add(file.id);
      }
    }

    const files = [];
    for (const entry of accessibleFiles) {
      const grants =
        entry.access === "owner"
          ? await this.grants.findByEntity("file", entry.file.id)
          : [];
      files.push(this.buildFileResponse(entry.file, grants));
    }

    const breadcrumb = await this.buildBreadcrumb(directoryId);
    return { directories, files, breadcrumb };
  }

  private async requireDirectory(
    ownerId: number,
    directoryId: number
  ): Promise<FileDirectory> {
    const dir = await this.directories.findById(directoryId);
    if (!dir) throw new NotFoundException({ message: "Directory not found" });
    if (dir.ownerId !== ownerId)
      throw new ForbiddenException({ message: "Not allowed" });
    return dir;
  }

  async createDirectory(
    ownerId: number,
    dto: CreateDirectoryDto
  ): Promise<any> {
    if (dto.parentId) {
      await this.requireDirectory(ownerId, dto.parentId);
    }
    const now = new Date();
    const dir = new FileDirectory(
      0,
      ownerId,
      dto.name.trim(),
      dto.parentId ?? null,
      now,
      now
    );
    const created = await this.directories.create(dir);
    return this.buildDirectoryResponse(created, []);
  }

  async updateDirectory(
    ownerId: number,
    id: number,
    dto: UpdateDirectoryDto
  ): Promise<any> {
    const dir = await this.requireDirectory(ownerId, id);
    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        dir.parentId = null;
      } else {
        const parent = await this.requireDirectory(ownerId, dto.parentId);
        if (parent.id === dir.id) {
          throw new BadRequestException({
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

  async deleteDirectory(ownerId: number, id: number): Promise<void> {
    await this.requireDirectory(ownerId, id);
    await this.directories.remove(id);
    await this.grants.removeForEntity("directory", id);
  }

  async uploadFile(
    ownerId: number,
    fileBuffer: Buffer,
    originalName: string,
    options: {
      directoryId?: number | null;
      displayName?: string;
      visibility?: FileVisibility;
      mimeType?: string | null;
      sizeBytes?: number | null;
    }
  ): Promise<any> {
    const directoryId = options.directoryId ?? null;
    if (directoryId) {
      await this.requireDirectory(ownerId, directoryId);
    }
    const now = new Date();
    const displayName = (options.displayName || originalName || "file").trim();
    const { storageKey, url } = await this.storage.save(
      fileBuffer,
      originalName
    );
    const fileEntity = new FileEntity(
      0,
      ownerId,
      directoryId,
      originalName,
      displayName,
      storageKey,
      options.mimeType ?? null,
      options.sizeBytes ?? fileBuffer.length,
      options.visibility ?? "private",
      now,
      now,
      url
    );
    const created = await this.files.create(fileEntity);
    return this.buildFileResponse(created, []);
  }

  async updateFile(
    ownerId: number,
    id: number,
    dto: UpdateFileDto
  ): Promise<any> {
    const file = await this.files.findById(id);
    if (!file) throw new NotFoundException({ message: "File not found" });
    if (file.ownerId !== ownerId)
      throw new ForbiddenException({ message: "Not allowed" });

    if (dto.directoryId !== undefined) {
      if (dto.directoryId === null) {
        file.directoryId = null;
      } else {
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

  async deleteFile(ownerId: number, id: number): Promise<void> {
    const file = await this.files.findById(id);
    if (!file) throw new NotFoundException({ message: "File not found" });
    if (file.ownerId !== ownerId)
      throw new ForbiddenException({ message: "Not allowed" });
    await this.files.remove(id);
    await this.grants.removeForEntity("file", id);
    await this.storage.delete(file.storageKey);
  }

  async updateDirectoryGrants(
    ownerId: number,
    id: number,
    dto: UpdateFileGrantsDto
  ): Promise<void> {
    const directory = await this.requireDirectory(ownerId, id);
    await this.grants.removeForEntity("directory", directory.id);
    for (const grant of dto.grants) {
      await this.grants.create(
        new FileGrant(0, "directory", directory.id, grant.roleId, grant.access)
      );
    }
  }

  async updateFileGrants(
    ownerId: number,
    id: number,
    dto: UpdateFileGrantsDto
  ): Promise<void> {
    const file = await this.files.findById(id);
    if (!file) throw new NotFoundException({ message: "File not found" });
    if (file.ownerId !== ownerId)
      throw new ForbiddenException({ message: "Not allowed" });
    await this.grants.removeForEntity("file", file.id);
    for (const grant of dto.grants) {
      await this.grants.create(
        new FileGrant(0, "file", file.id, grant.roleId, grant.access)
      );
    }
  }
}
