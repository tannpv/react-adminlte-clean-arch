import { Product } from '../entities/product.entity'
import { DomainEvent } from './domain-event'

export class ProductUpdatedEvent extends DomainEvent {
  static readonly eventName = 'product.updated'
  readonly name = ProductUpdatedEvent.eventName

  constructor(readonly product: Product) {
    super()
  }
}
