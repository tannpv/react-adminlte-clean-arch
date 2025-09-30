import { User } from '../entities/user.entity'
import { DomainEvent } from './domain-event'

export class UserRemovedEvent extends DomainEvent {
  static readonly eventName = 'user.removed'
  readonly name = UserRemovedEvent.eventName

  constructor(readonly user: User) {
    super()
  }
}
