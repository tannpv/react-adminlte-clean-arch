import { Role } from '../../../domain/entities/role.entity';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { MysqlDatabaseService } from './mysql-database.service';
export declare class MysqlRoleRepository implements RoleRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findAll(): Promise<Role[]>;
    findById(id: number): Promise<Role | null>;
    findByIds(ids: number[]): Promise<Role[]>;
    findByName(name: string): Promise<Role | null>;
    create(role: Role): Promise<Role>;
    update(role: Role): Promise<Role>;
    remove(id: number): Promise<Role | null>;
    nextId(): Promise<number>;
    private hydrateRole;
    private replacePermissions;
}
