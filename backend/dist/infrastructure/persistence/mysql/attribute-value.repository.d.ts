import { AttributeValue } from "../../../domain/entities/attribute-value.entity";
import { AttributeValueRepository } from "../../../domain/repositories/attribute-value.repository";
import { MysqlDatabaseService } from "./mysql-database.service";
export declare class MysqlAttributeValueRepository implements AttributeValueRepository {
    private readonly database;
    constructor(database: MysqlDatabaseService);
    findAll(): Promise<AttributeValue[]>;
    findById(id: number): Promise<AttributeValue | null>;
    findByAttributeId(attributeId: number): Promise<AttributeValue[]>;
    findByAttributeIdAndValueCode(attributeId: number, valueCode: string): Promise<AttributeValue | null>;
    create(attributeValue: AttributeValue): Promise<AttributeValue>;
    update(attributeValue: AttributeValue): Promise<AttributeValue>;
    delete(id: number): Promise<void>;
    deleteByAttributeId(attributeId: number): Promise<void>;
    existsByAttributeIdAndValueCode(attributeId: number, valueCode: string, excludeId?: number): Promise<boolean>;
    private mapRowToEntity;
}
