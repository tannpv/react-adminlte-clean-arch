export class ProductVariantAttributeValue {
  constructor(
    public readonly id: number,
    public readonly variantId: number,
    public readonly attributeId: number,
    public readonly valueText: string | null,
    public readonly valueNumber: number | null,
    public readonly valueBoolean: boolean | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    variantId: number,
    attributeId: number,
    valueText?: string | null,
    valueNumber?: number | null,
    valueBoolean?: boolean | null
  ): ProductVariantAttributeValue {
    const now = new Date();
    return new ProductVariantAttributeValue(
      0, // Will be set by database
      variantId,
      attributeId,
      valueText || null,
      valueNumber || null,
      valueBoolean || null,
      now,
      now
    );
  }

  update(
    valueText?: string | null,
    valueNumber?: number | null,
    valueBoolean?: boolean | null
  ): ProductVariantAttributeValue {
    return new ProductVariantAttributeValue(
      this.id,
      this.variantId,
      this.attributeId,
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
    return this.valueText !== null || this.valueNumber !== null || this.valueBoolean !== null;
  }
}

