import { Product } from '../entities/product.entity';
import { DomainEvent } from './domain-event';
export declare class ProductUpdatedEvent extends DomainEvent {
    readonly product: Product;
    static readonly eventName = "product.updated";
    readonly name = "product.updated";
    constructor(product: Product);
}
