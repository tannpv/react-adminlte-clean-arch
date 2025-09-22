import { AttributeResponseDto } from "./attribute-response.dto";
export declare class AttributeSetResponseDto {
    id: number;
    name: string;
    description: string | null;
    isSystem: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    attributes: AttributeResponseDto[];
    constructor(id: number, name: string, description: string | null, isSystem: boolean, sortOrder: number, createdAt: Date, updatedAt: Date, attributes?: AttributeResponseDto[]);
}
