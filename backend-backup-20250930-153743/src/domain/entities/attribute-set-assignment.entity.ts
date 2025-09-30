export class AttributeSetAssignment {
  constructor(
    public readonly id: number,
    public readonly attributeSetId: number,
    public readonly attributeId: number,
    public readonly sortOrder: number,
    public readonly isRequired: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    attributeSetId: number,
    attributeId: number,
    sortOrder: number = 0,
    isRequired: boolean = false
  ): AttributeSetAssignment {
    const now = new Date();
    return new AttributeSetAssignment(
      0, // Will be set by database
      attributeSetId,
      attributeId,
      sortOrder,
      isRequired,
      now,
      now
    );
  }

  update(sortOrder?: number, isRequired?: boolean): AttributeSetAssignment {
    return new AttributeSetAssignment(
      this.id,
      this.attributeSetId,
      this.attributeId,
      sortOrder ?? this.sortOrder,
      isRequired ?? this.isRequired,
      this.createdAt,
      new Date()
    );
  }
}
