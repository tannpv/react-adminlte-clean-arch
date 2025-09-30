import { DomainEvent } from '../../../../shared/kernel';

export class UserDeletedEvent extends DomainEvent {
  constructor(
    public readonly userId: number,
    public readonly userEmail: string,
    public readonly userFullName: string,
    public readonly deletedBy: number,
  ) {
    super();
  }
}
