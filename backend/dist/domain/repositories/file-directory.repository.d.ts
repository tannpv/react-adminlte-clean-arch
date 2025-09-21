import { FileDirectory } from '../entities/file-directory.entity';
export interface FileDirectoryRepository {
    findById(id: number): Promise<FileDirectory | null>;
    findByIds(ids: number[]): Promise<FileDirectory[]>;
    findChildren(ownerId: number, parentId: number | null): Promise<FileDirectory[]>;
    findRoot(ownerId: number): Promise<FileDirectory[]>;
    findByParent(parentId: number | null): Promise<FileDirectory[]>;
    create(directory: FileDirectory): Promise<FileDirectory>;
    update(directory: FileDirectory): Promise<FileDirectory>;
    remove(id: number): Promise<void>;
}
export declare const FILE_DIRECTORY_REPOSITORY = "FILE_DIRECTORY_REPOSITORY";
