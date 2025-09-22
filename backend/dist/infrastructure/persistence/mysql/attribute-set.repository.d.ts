import { AttributeSet } from "../../../domain/entities/attribute-set.entity";
import { AttributeSetRepository } from "../../../domain/repositories/attribute-set.repository";
import { MysqlDatabaseService } from "./mysql-database.service";
export declare class MysqlAttributeSetRepository implements AttributeSetRepository {
    private readonly database;
    constructor(database: MysqlDatabaseService);
    findAll(): Promise<AttributeSet[]>;
    findById(id: number): Promise<AttributeSet | null>;
    findByName(name: string): Promise<AttributeSet | null>;
    create(attributeSet: AttributeSet): Promise<AttributeSet>;
    update(attributeSet: AttributeSet): Promise<AttributeSet>;
    delete(id: number): Promise<void>;
    existsByName(name: string, excludeId?: number): Promise<boolean>;
    private mapRowToEntity;
}
