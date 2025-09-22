export declare class CreateAttributeDto {
    code: string;
    name: string;
    inputType: "select" | "multiselect" | "text" | "number" | "boolean";
    dataType: "string" | "number" | "boolean";
    unit?: string;
}
