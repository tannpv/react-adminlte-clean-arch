import { AttributeSetAssignment } from "../../../domain/entities/attribute-set-assignment.entity";
import { AttributeSetAssignmentRepository } from "../../../domain/repositories/attribute-set-assignment.repository";
import { MysqlDatabaseService } from "./mysql-database.service";
export declare class MysqlAttributeSetAssignmentRepository implements AttributeSetAssignmentRepository {
    private readonly database;
    constructor(database: MysqlDatabaseService);
    findAll(): Promise<AttributeSetAssignment[]>;
    findById(id: number): Promise<AttributeSetAssignment | null>;
    findByAttributeSetId(attributeSetId: number): Promise<AttributeSetAssignment[]>;
    findByAttributeId(attributeId: number): Promise<AttributeSetAssignment[]>;
    findByAttributeSetIdAndAttributeId(attributeSetId: number, attributeId: number): Promise<AttributeSetAssignment | null>;
    create(assignment: AttributeSetAssignment): Promise<AttributeSetAssignment>;
    update(assignment: AttributeSetAssignment): Promise<AttributeSetAssignment>;
    delete(id: number): Promise<void>;
    deleteByAttributeSetId(attributeSetId: number): Promise<void>;
    deleteByAttributeId(attributeId: number): Promise<void>;
    existsByAttributeSetIdAndAttributeId(attributeSetId: number, attributeId: number, excludeId?: number): Promise<boolean>;
    private mapRowToEntity;
}
