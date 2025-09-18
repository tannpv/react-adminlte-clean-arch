export type ProductStatus = 'draft' | 'published' | 'archived';
export interface ProductProps {
    id: number;
    sku: string;
    name: string;
    description?: string | null;
    priceCents: number;
    currency: string;
    status: ProductStatus;
    metadata?: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Product {
    private props;
    constructor(props: ProductProps);
    get id(): number;
    get sku(): string;
    set sku(value: string);
    get name(): string;
    set name(value: string);
    get description(): string | null | undefined;
    set description(value: string | null | undefined);
    get priceCents(): number;
    set priceCents(value: number);
    get currency(): string;
    set currency(value: string);
    get status(): ProductStatus;
    set status(value: ProductStatus);
    get metadata(): Record<string, unknown> | null | undefined;
    set metadata(value: Record<string, unknown> | null | undefined);
    get createdAt(): Date;
    set createdAt(value: Date);
    get updatedAt(): Date;
    set updatedAt(value: Date);
    clone(): Product;
}
