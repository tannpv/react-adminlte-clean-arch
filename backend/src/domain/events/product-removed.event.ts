import { Product } from '../entities/product.entity'
import { DomainEvent } from './domain-event'

export class ProductRemovedEvent extends DomainEvent {
  static readonly eventName = 'product.removed'
  readonly name = ProductRemovedEvent.eventName

  constructor(readonly product: Product) {
    super()
  }
}
