import { DomainEvent, DomainEventHandler } from '../../domain/events/domain-event';
export declare class DomainEventBus {
    private readonly handlers;
    private readonly logger;
    publish<T extends DomainEvent>(event: T): void;
    publishAll(events: DomainEvent[]): Promise<void>;
    subscribe(eventName: string, handler: DomainEventHandler): () => void;
}
