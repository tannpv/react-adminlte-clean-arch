import { User } from '../entities/user.entity'
import { DomainEvent } from './domain-event'

export class UserUpdatedEvent extends DomainEvent {
  static readonly eventName = 'user.updated'
  readonly name = UserUpdatedEvent.eventName

  constructor(readonly user: User) {
    super()
  }
}
