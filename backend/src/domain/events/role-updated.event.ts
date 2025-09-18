import { Role } from '../entities/role.entity'
import { DomainEvent } from './domain-event'

export class RoleUpdatedEvent extends DomainEvent {
  static readonly eventName = 'role.updated'
  readonly name = RoleUpdatedEvent.eventName

  constructor(readonly role: Role) {
    super()
  }
}
