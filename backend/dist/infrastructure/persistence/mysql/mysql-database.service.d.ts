import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { FieldPacket, OkPacket, Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { PasswordService } from "../../../shared/password.service";
export interface MysqlConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export declare class MysqlDatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly passwordService;
    private readonly logger;
    private pool;
    private readonly config;
    constructor(passwordService: PasswordService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getPool(): Pool;
    getDatabaseName(): string;
    private initialize;
    private runMigrations;
    private seedDefaults;
    private ensureUsersHavePasswords;
    private insertRole;
    private ensureSampleProduct;
    private ensureDefaultCategories;
    private insertPermissions;
    execute<T extends RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader = RowDataPacket[]>(sql: string, params?: any): Promise<[T, FieldPacket[]]>;
}
