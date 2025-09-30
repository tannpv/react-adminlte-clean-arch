export class AttributeValue {
  constructor(
    public readonly id: number,
    public readonly attributeId: number,
    public readonly valueCode: string,
    public readonly label: string,
    public readonly sortOrder: number
  ) {}

  static create(
    attributeId: number,
    valueCode: string,
    label: string,
    sortOrder: number = 0
  ): AttributeValue {
    return new AttributeValue(
      0, // Will be set by database
      attributeId,
      valueCode,
      label,
      sortOrder
    );
  }

  update(
    valueCode?: string,
    label?: string,
    sortOrder?: number
  ): AttributeValue {
    return new AttributeValue(
      this.id,
      this.attributeId,
      valueCode ?? this.valueCode,
      label ?? this.label,
      sortOrder ?? this.sortOrder
    );
  }
}
