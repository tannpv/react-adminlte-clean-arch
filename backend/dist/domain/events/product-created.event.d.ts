import { Product } from '../entities/product.entity';
import { DomainEvent } from './domain-event';
export declare class ProductCreatedEvent extends DomainEvent {
    readonly product: Product;
    static readonly eventName = "product.created";
    readonly name = "product.created";
    constructor(product: Product);
}
