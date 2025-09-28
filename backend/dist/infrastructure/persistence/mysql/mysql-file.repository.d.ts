import { FileEntity } from '../../../domain/entities/file.entity';
import { FileRepository } from '../../../domain/repositories/file.repository';
import { MysqlDatabaseService } from './mysql-database.service';
export declare class MysqlFileRepository implements FileRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findById(id: number): Promise<FileEntity | null>;
    findByIds(ids: number[]): Promise<FileEntity[]>;
    findByDirectory(ownerId: number, directoryId: number | null): Promise<FileEntity[]>;
    findByDirectoryAny(directoryId: number | null): Promise<FileEntity[]>;
    create(file: FileEntity): Promise<FileEntity>;
    update(file: FileEntity): Promise<FileEntity>;
    remove(id: number): Promise<void>;
    private hydrate;
}
