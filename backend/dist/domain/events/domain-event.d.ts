export declare abstract class DomainEvent {
    readonly occurredAt: Date;
    constructor(occurredAt?: Date);
    abstract readonly name: string;
}
export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;
