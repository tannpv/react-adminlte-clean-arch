export declare class ProductVariant {
    readonly id: number;
    readonly productId: number;
    readonly sku: string;
    readonly name: string;
    readonly priceCents: number;
    readonly currency: string;
    readonly status: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: number, productId: number, sku: string, name: string, priceCents: number, currency: string, status: string, createdAt: Date, updatedAt: Date);
    static create(productId: number, sku: string, name: string, priceCents: number, currency?: string, status?: string): ProductVariant;
    update(sku?: string, name?: string, priceCents?: number, currency?: string, status?: string): ProductVariant;
    getPrice(): number;
    setPrice(price: number): ProductVariant;
    isActive(): boolean;
    activate(): ProductVariant;
    deactivate(): ProductVariant;
}
