import { Role } from '../entities/role.entity';
import { DomainEvent } from './domain-event';
export declare class RoleCreatedEvent extends DomainEvent {
    readonly role: Role;
    static readonly eventName = "role.created";
    readonly name = "role.created";
    constructor(role: Role);
}
