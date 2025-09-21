import { FileGrant, FileGrantEntityType } from '../../../domain/entities/file-grant.entity';
import { FileGrantRepository } from '../../../domain/repositories/file-grant.repository';
import { MysqlDatabaseService } from './mysql-database.service';
export declare class MysqlFileGrantRepository implements FileGrantRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findByEntity(entityType: FileGrantEntityType, entityId: number): Promise<FileGrant[]>;
    findForRole(entityType: FileGrantEntityType, entityId: number, roleIds: number[]): Promise<FileGrant[]>;
    create(grant: FileGrant): Promise<FileGrant>;
    remove(id: number): Promise<void>;
    removeForEntity(entityType: FileGrantEntityType, entityId: number): Promise<void>;
    private hydrate;
}
