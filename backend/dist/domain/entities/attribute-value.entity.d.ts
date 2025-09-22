export declare class AttributeValue {
    readonly id: number;
    readonly attributeId: number;
    readonly valueCode: string;
    readonly label: string;
    readonly sortOrder: number;
    constructor(id: number, attributeId: number, valueCode: string, label: string, sortOrder: number);
    static create(attributeId: number, valueCode: string, label: string, sortOrder?: number): AttributeValue;
    update(valueCode?: string, label?: string, sortOrder?: number): AttributeValue;
}
