import { User } from '../entities/user.entity';
import { DomainEvent } from './domain-event';
export declare class UserRemovedEvent extends DomainEvent {
    readonly user: User;
    static readonly eventName = "user.removed";
    readonly name = "user.removed";
    constructor(user: User);
}
