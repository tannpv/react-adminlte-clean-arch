import { Attribute } from "../../../domain/entities/attribute.entity";
import { AttributeRepository } from "../../../domain/repositories/attribute.repository";
import { MysqlDatabaseService } from "./mysql-database.service";
export declare class MysqlAttributeRepository implements AttributeRepository {
    private readonly database;
    constructor(database: MysqlDatabaseService);
    findAll(): Promise<Attribute[]>;
    findById(id: number): Promise<Attribute | null>;
    findByCode(code: string): Promise<Attribute | null>;
    create(attribute: Attribute): Promise<Attribute>;
    update(attribute: Attribute): Promise<Attribute>;
    delete(id: number): Promise<void>;
    existsByCode(code: string, excludeId?: number): Promise<boolean>;
    private mapRowToEntity;
}
