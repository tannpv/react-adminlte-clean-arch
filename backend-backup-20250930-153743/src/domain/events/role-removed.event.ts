import { Role } from '../entities/role.entity'
import { DomainEvent } from './domain-event'

export class RoleRemovedEvent extends DomainEvent {
  static readonly eventName = 'role.removed'
  readonly name = RoleRemovedEvent.eventName

  constructor(readonly role: Role) {
    super()
  }
}
