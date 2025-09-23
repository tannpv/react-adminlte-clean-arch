export declare class ProductAttributeValue {
    readonly id: number;
    readonly productId: number;
    readonly attributeId: number;
    readonly attributeValueId: number | null;
    readonly valueText: string | null;
    readonly valueNumber: number | null;
    readonly valueBoolean: boolean | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: number, productId: number, attributeId: number, attributeValueId: number | null, valueText: string | null, valueNumber: number | null, valueBoolean: boolean | null, createdAt: Date, updatedAt: Date);
    static create(productId: number, attributeId: number, attributeValueId?: number | null, valueText?: string | null, valueNumber?: number | null, valueBoolean?: boolean | null): ProductAttributeValue;
    update(attributeValueId?: number | null, valueText?: string | null, valueNumber?: number | null, valueBoolean?: boolean | null): ProductAttributeValue;
    getValue(): string | number | boolean | null;
    hasValue(): boolean;
}
