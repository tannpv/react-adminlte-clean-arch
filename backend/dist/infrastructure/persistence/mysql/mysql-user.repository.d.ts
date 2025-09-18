import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { MysqlDatabaseService } from './mysql-database.service';
export declare class MysqlUserRepository implements UserRepository {
    private readonly db;
    constructor(db: MysqlDatabaseService);
    findAll(): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(user: User): Promise<User>;
    update(user: User): Promise<User>;
    remove(id: number): Promise<User | null>;
    nextId(): Promise<number>;
    private hydrateUser;
    private saveRoles;
}
