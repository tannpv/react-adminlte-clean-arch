import { Product } from '../entities/product.entity'
import { DomainEvent } from './domain-event'

export class ProductCreatedEvent extends DomainEvent {
  static readonly eventName = 'product.created'
  readonly name = ProductCreatedEvent.eventName

  constructor(readonly product: Product) {
    super()
  }
}
