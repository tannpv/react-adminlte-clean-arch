export class ProductAttributeValue {
  constructor(
    public readonly id: number,
    public readonly productId: number, // INT - matches products.id
    public readonly attributeId: number, // BIGINT UNSIGNED - matches attributes.id
    public readonly attributeValueId: number | null, // Reference to attribute_values.id
    public readonly valueText: string | null,
    public readonly valueNumber: number | null,
    public readonly valueBoolean: boolean | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    productId: number,
    attributeId: number,
    attributeValueId?: number | null,
    valueText?: string | null,
    valueNumber?: number | null,
    valueBoolean?: boolean | null
  ): ProductAttributeValue {
    const now = new Date();
    return new ProductAttributeValue(
      0, // Will be set by database
      productId,
      attributeId,
      attributeValueId || null,
      valueText || null,
      valueNumber || null,
      valueBoolean || null,
      now,
      now
    );
  }

  update(
    attributeValueId?: number | null,
    valueText?: string | null,
    valueNumber?: number | null,
    valueBoolean?: boolean | null
  ): ProductAttributeValue {
    return new ProductAttributeValue(
      this.id,
      this.productId,
      this.attributeId,
      attributeValueId !== undefined ? attributeValueId : this.attributeValueId,
      valueText !== undefined ? valueText : this.valueText,
      valueNumber !== undefined ? valueNumber : this.valueNumber,
      valueBoolean !== undefined ? valueBoolean : this.valueBoolean,
      this.createdAt,
      new Date()
    );
  }

  getValue(): string | number | boolean | null {
    if (this.valueText !== null) return this.valueText;
    if (this.valueNumber !== null) return this.valueNumber;
    if (this.valueBoolean !== null) return this.valueBoolean;
    return null;
  }

  hasValue(): boolean {
    return (
      this.valueText !== null ||
      this.valueNumber !== null ||
      this.valueBoolean !== null
    );
  }
}
