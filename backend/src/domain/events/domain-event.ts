export abstract class DomainEvent {
  constructor(readonly occurredAt: Date = new Date()) {}
  abstract readonly name: string
}

export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void
