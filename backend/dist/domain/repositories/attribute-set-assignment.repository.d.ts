import { AttributeSetAssignment } from "../entities/attribute-set-assignment.entity";
export interface AttributeSetAssignmentRepository {
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
}
