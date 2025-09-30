import { DomainEvent } from '../../../../shared/kernel';

export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: number,
    public readonly userEmail: string,
    public readonly userFullName: string,
    public readonly createdBy: number,
  ) {
    super();
  }
}
