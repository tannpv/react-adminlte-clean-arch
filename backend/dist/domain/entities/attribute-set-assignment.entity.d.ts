export declare class AttributeSetAssignment {
    readonly id: number;
    readonly attributeSetId: number;
    readonly attributeId: number;
    readonly sortOrder: number;
    readonly isRequired: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: number, attributeSetId: number, attributeId: number, sortOrder: number, isRequired: boolean, createdAt: Date, updatedAt: Date);
    static create(attributeSetId: number, attributeId: number, sortOrder?: number, isRequired?: boolean): AttributeSetAssignment;
    update(sortOrder?: number, isRequired?: boolean): AttributeSetAssignment;
}
