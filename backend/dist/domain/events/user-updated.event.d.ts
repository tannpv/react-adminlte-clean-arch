import { User } from '../entities/user.entity';
import { DomainEvent } from './domain-event';
export declare class UserUpdatedEvent extends DomainEvent {
    readonly user: User;
    static readonly eventName = "user.updated";
    readonly name = "user.updated";
    constructor(user: User);
}
