export declare class AttributeResponseDto {
    id: number;
    code: string;
    name: string;
    inputType: "select" | "multiselect" | "text" | "number" | "boolean";
    dataType: "string" | "number" | "boolean";
    unit: string | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(id: number, code: string, name: string, inputType: "select" | "multiselect" | "text" | "number" | "boolean", dataType: "string" | "number" | "boolean", unit: string | null, createdAt: Date, updatedAt: Date);
}
