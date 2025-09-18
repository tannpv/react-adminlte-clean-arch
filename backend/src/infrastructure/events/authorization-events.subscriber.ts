import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { AuthorizationService } from '../../application/services/authorization.service'
import { DomainEventBus } from '../../shared/events/domain-event.bus'
import { UserCreatedEvent } from '../../domain/events/user-created.event'
import { UserUpdatedEvent } from '../../domain/events/user-updated.event'
import { UserRemovedEvent } from '../../domain/events/user-removed.event'
import { RoleCreatedEvent } from '../../domain/events/role-created.event'
import { RoleUpdatedEvent } from '../../domain/events/role-updated.event'
import { RoleRemovedEvent } from '../../domain/events/role-removed.event'

@Injectable()
export class AuthorizationEventsSubscriber implements OnModuleDestroy {
  private readonly unsubscribers: Array<() => void> = []

  constructor(private readonly bus: DomainEventBus, private readonly authorization: AuthorizationService) {
    this.unsubscribers.push(
      this.bus.subscribe(UserCreatedEvent.eventName, (event) => {
        const typed = event as UserCreatedEvent
        if (typed?.user?.id) {
          this.authorization.evictPermissionsForUser(typed.user.id)
        }
      }),
      this.bus.subscribe(UserUpdatedEvent.eventName, (event) => {
        const typed = event as UserUpdatedEvent
        if (typed?.user?.id) {
          this.authorization.evictPermissionsForUser(typed.user.id)
        }
      }),
      this.bus.subscribe(UserRemovedEvent.eventName, (event) => {
        const typed = event as UserRemovedEvent
        if (typed?.user?.id) {
          this.authorization.evictPermissionsForUser(typed.user.id)
        }
      }),
      this.bus.subscribe(RoleCreatedEvent.eventName, () => this.authorization.evictAllPermissions()),
      this.bus.subscribe(RoleUpdatedEvent.eventName, () => this.authorization.evictAllPermissions()),
      this.bus.subscribe(RoleRemovedEvent.eventName, () => this.authorization.evictAllPermissions()),
    )
  }

  onModuleDestroy(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe())
    this.unsubscribers.length = 0
  }
}
