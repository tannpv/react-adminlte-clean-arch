export declare class Attribute {
    readonly id: number;
    readonly code: string;
    readonly name: string;
    readonly inputType: "select" | "multiselect" | "text" | "number" | "boolean";
    readonly dataType: "string" | "number" | "boolean";
    readonly unit: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: number, code: string, name: string, inputType: "select" | "multiselect" | "text" | "number" | "boolean", dataType: "string" | "number" | "boolean", unit: string | null, createdAt: Date, updatedAt: Date);
    static create(code: string, name: string, inputType: "select" | "multiselect" | "text" | "number" | "boolean", dataType: "string" | "number" | "boolean", unit?: string | null): Attribute;
    update(code?: string, name?: string, inputType?: "select" | "multiselect" | "text" | "number" | "boolean", dataType?: "string" | "number" | "boolean", unit?: string | null): Attribute;
    isSelectType(): boolean;
    isTextType(): boolean;
    isNumberType(): boolean;
    isBooleanType(): boolean;
}
