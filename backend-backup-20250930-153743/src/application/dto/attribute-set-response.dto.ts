import { AttributeResponseDto } from "./attribute-response.dto";

export class AttributeSetResponseDto {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  attributes: AttributeResponseDto[];

  constructor(
    id: number,
    name: string,
    description: string | null,
    isSystem: boolean,
    sortOrder: number,
    createdAt: Date,
    updatedAt: Date,
    attributes: AttributeResponseDto[] = []
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isSystem = isSystem;
    this.sortOrder = sortOrder;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.attributes = attributes;
  }
}
