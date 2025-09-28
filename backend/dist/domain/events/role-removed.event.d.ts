import { Role } from '../entities/role.entity';
import { DomainEvent } from './domain-event';
export declare class RoleRemovedEvent extends DomainEvent {
    readonly role: Role;
    static readonly eventName = "role.removed";
    readonly name = "role.removed";
    constructor(role: Role);
}
