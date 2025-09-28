import { Role } from '../entities/role.entity';
import { DomainEvent } from './domain-event';
export declare class RoleUpdatedEvent extends DomainEvent {
    readonly role: Role;
    static readonly eventName = "role.updated";
    readonly name = "role.updated";
    constructor(role: Role);
}
