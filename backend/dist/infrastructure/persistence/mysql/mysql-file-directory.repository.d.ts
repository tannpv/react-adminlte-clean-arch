import { FileDirectory } from '../../../domain/entities/file-directory.entity';
import { FileDirectoryRepository } from '../../../domain/repositories/file-directory.repository';
import { MysqlDatabaseService } from './mysql-database.service';
export declare class MysqlFileDirectoryRepository implements FileDirectoryRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findById(id: number): Promise<FileDirectory | null>;
    findByIds(ids: number[]): Promise<FileDirectory[]>;
    findChildren(ownerId: number, parentId: number | null): Promise<FileDirectory[]>;
    findRoot(ownerId: number): Promise<FileDirectory[]>;
    findByParent(parentId: number | null): Promise<FileDirectory[]>;
    create(directory: FileDirectory): Promise<FileDirectory>;
    update(directory: FileDirectory): Promise<FileDirectory>;
    remove(id: number): Promise<void>;
    private hydrate;
}
