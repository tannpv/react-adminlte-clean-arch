export class AttributeSetAssignmentResponseDto {
  id: number;
  attributeSetId: number;
  attributeId: number;
  sortOrder: number;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    attributeSetId: number,
    attributeId: number,
    sortOrder: number,
    isRequired: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.attributeSetId = attributeSetId;
    this.attributeId = attributeId;
    this.sortOrder = sortOrder;
    this.isRequired = isRequired;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
