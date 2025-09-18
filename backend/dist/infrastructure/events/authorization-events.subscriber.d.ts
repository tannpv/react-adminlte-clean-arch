import { OnModuleDestroy } from '@nestjs/common';
import { AuthorizationService } from '../../application/services/authorization.service';
import { DomainEventBus } from '../../shared/events/domain-event.bus';
export declare class AuthorizationEventsSubscriber implements OnModuleDestroy {
    private readonly bus;
    private readonly authorization;
    private readonly unsubscribers;
    constructor(bus: DomainEventBus, authorization: AuthorizationService);
    onModuleDestroy(): void;
}
