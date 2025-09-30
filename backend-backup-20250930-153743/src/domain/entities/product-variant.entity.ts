export class ProductVariant {
  constructor(
    public readonly id: number,
    public readonly productId: number, // INT - matches products.id
    public readonly sku: string,
    public readonly name: string,
    public readonly priceCents: number,
    public readonly currency: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    productId: number,
    sku: string,
    name: string,
    priceCents: number,
    currency: string = "USD",
    status: string = "active"
  ): ProductVariant {
    const now = new Date();
    return new ProductVariant(
      0, // Will be set by database
      productId,
      sku,
      name,
      priceCents,
      currency,
      status,
      now,
      now
    );
  }

  update(
    sku?: string,
    name?: string,
    priceCents?: number,
    currency?: string,
    status?: string
  ): ProductVariant {
    return new ProductVariant(
      this.id,
      this.productId,
      sku ?? this.sku,
      name ?? this.name,
      priceCents ?? this.priceCents,
      currency ?? this.currency,
      status ?? this.status,
      this.createdAt,
      new Date()
    );
  }

  getPrice(): number {
    return this.priceCents / 100;
  }

  setPrice(price: number): ProductVariant {
    return this.update(undefined, undefined, Math.round(price * 100));
  }

  isActive(): boolean {
    return this.status === "active";
  }

  activate(): ProductVariant {
    return this.update(undefined, undefined, undefined, undefined, "active");
  }

  deactivate(): ProductVariant {
    return this.update(undefined, undefined, undefined, undefined, "inactive");
  }
}
