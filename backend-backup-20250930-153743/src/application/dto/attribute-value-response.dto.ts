export class AttributeValueResponseDto {
  id: number;
  attributeId: number;
  valueCode: string;
  label: string;
  sortOrder: number;

  constructor(
    id: number,
    attributeId: number,
    valueCode: string,
    label: string,
    sortOrder: number
  ) {
    this.id = id;
    this.attributeId = attributeId;
    this.valueCode = valueCode;
    this.label = label;
    this.sortOrder = sortOrder;
  }
}
