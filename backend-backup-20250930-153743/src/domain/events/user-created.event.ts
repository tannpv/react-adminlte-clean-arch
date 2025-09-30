import { User } from '../entities/user.entity'
import { DomainEvent } from './domain-event'

export class UserCreatedEvent extends DomainEvent {
  static readonly eventName = 'user.created'
  readonly name = UserCreatedEvent.eventName

  constructor(readonly user: User) {
    super()
  }
}
