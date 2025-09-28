import { User } from '../entities/user.entity';
import { DomainEvent } from './domain-event';
export declare class UserCreatedEvent extends DomainEvent {
    readonly user: User;
    static readonly eventName = "user.created";
    readonly name = "user.created";
    constructor(user: User);
}
