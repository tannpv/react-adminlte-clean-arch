import { Product } from '../entities/product.entity';
import { DomainEvent } from './domain-event';
export declare class ProductRemovedEvent extends DomainEvent {
    readonly product: Product;
    static readonly eventName = "product.removed";
    readonly name = "product.removed";
    constructor(product: Product);
}
