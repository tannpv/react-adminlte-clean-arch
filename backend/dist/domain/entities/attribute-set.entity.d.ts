import { Attribute } from "./attribute.entity";
export declare class AttributeSet {
    readonly id: number;
    readonly name: string;
    readonly description: string | null;
    readonly isSystem: boolean;
    readonly sortOrder: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly attributes: Attribute[];
    constructor(id: number, name: string, description: string | null, isSystem: boolean, sortOrder: number, createdAt: Date, updatedAt: Date, attributes?: Attribute[]);
    static create(name: string, description?: string | null, isSystem?: boolean, sortOrder?: number): AttributeSet;
    update(name?: string, description?: string | null, isSystem?: boolean, sortOrder?: number): AttributeSet;
    addAttribute(attribute: Attribute): AttributeSet;
    removeAttribute(attributeId: number): AttributeSet;
    hasAttribute(attributeId: number): boolean;
    getAttributeCount(): number;
}
