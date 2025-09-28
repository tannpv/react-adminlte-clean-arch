export declare class ProductVariantAttributeValue {
    readonly id: number;
    readonly variantId: number;
    readonly attributeId: number;
    readonly valueText: string | null;
    readonly valueNumber: number | null;
    readonly valueBoolean: boolean | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: number, variantId: number, attributeId: number, valueText: string | null, valueNumber: number | null, valueBoolean: boolean | null, createdAt: Date, updatedAt: Date);
    static create(variantId: number, attributeId: number, valueText?: string | null, valueNumber?: number | null, valueBoolean?: boolean | null): ProductVariantAttributeValue;
    update(valueText?: string | null, valueNumber?: number | null, valueBoolean?: boolean | null): ProductVariantAttributeValue;
    getValue(): string | number | boolean | null;
    hasValue(): boolean;
}
