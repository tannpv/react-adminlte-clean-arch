import { AttributeValue } from "../entities/attribute-value.entity";
export interface AttributeValueRepository {
    findAll(): Promise<AttributeValue[]>;
    findById(id: number): Promise<AttributeValue | null>;
    findByAttributeId(attributeId: number): Promise<AttributeValue[]>;
    findByAttributeIdAndValueCode(attributeId: number, valueCode: string): Promise<AttributeValue | null>;
    create(attributeValue: AttributeValue): Promise<AttributeValue>;
    update(attributeValue: AttributeValue): Promise<AttributeValue>;
    delete(id: number): Promise<void>;
    deleteByAttributeId(attributeId: number): Promise<void>;
    existsByAttributeIdAndValueCode(attributeId: number, valueCode: string, excludeId?: number): Promise<boolean>;
}
