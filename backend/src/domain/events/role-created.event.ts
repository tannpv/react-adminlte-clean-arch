import { Role } from '../entities/role.entity'
import { DomainEvent } from './domain-event'

export class RoleCreatedEvent extends DomainEvent {
  static readonly eventName = 'role.created'
  readonly name = RoleCreatedEvent.eventName

  constructor(readonly role: Role) {
    super()
  }
}
